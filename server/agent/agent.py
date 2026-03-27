import atexit
import hashlib
import importlib
import ipaddress
import json
import os
import re
import socket
import threading
import time
import uuid
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote_plus, urljoin, urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class Agent:

	SUPPORTED_SOURCES = ("linkedin", "indeed", "dev.bg", "jobs.bg")

	def __init__(self, cache=None):
		self.cache = cache
		self.request_timeout = float(os.getenv("JOB_SOURCE_TIMEOUT_SECONDS", "6"))
		self.total_timeout = float(os.getenv("JOB_SEARCH_TOTAL_TIMEOUT_SECONDS", "25"))
		self.max_workers = int(os.getenv("JOB_SOURCE_MAX_WORKERS", "4"))
		self.max_results = int(os.getenv("JOB_SEARCH_MAX_RESULTS", "10"))
		self.max_source_items = int(os.getenv("JOB_SOURCE_MAX_ITEMS", "30"))
		self.cache_ttl = int(os.getenv("JOB_CACHE_TTL_SECONDS", "300"))
		self.min_domain_interval = float(os.getenv("JOB_SOURCE_MIN_DOMAIN_INTERVAL", "0.3"))
		self.strict_compliance = self._is_truthy(os.getenv("JOB_STRICT_COMPLIANCE", "true"))
		self.allowed_domains = self._build_allowed_domains()
		self.user_agent = os.getenv(
			"JOB_SOURCE_USER_AGENT",
			"VocantaJobAgent/1.0 (+https://github.com/KKIvanov22/Vocanta)",
		)

		self._domain_lock = threading.Lock()
		self._last_request_by_domain: Dict[str, float] = {}
		self.session = self._build_http_session()

		self.weaviate_client = self._build_weaviate_client()
		self.weaviate_cloud = self._is_weaviate_cloud_deployment(
			os.getenv("WEAVIATE_URL", "").strip()
		)
		self.weaviate_query_agent = None
		self.weaviate_personalization_agent = None
		self._transformation_lock = threading.Lock()
		self._transformation_thread: Optional[threading.Thread] = None
		self._ensure_weaviate_schema()
		self._init_weaviate_agents()
		if self.weaviate_client:
			atexit.register(self._close_weaviate)

	def search_jobs(self, payload: Dict[str, Any]) -> Dict[str, Any]:
		profile = self._validate_payload(payload)
		cache_key = self._build_cache_key(profile)
		cached = self._cache_get(cache_key)
		if cached:
			cached["cache_hit"] = True
			return cached

		scanned_jobs, source_status = self._scan_sources(profile)
		scanned_jobs = self._deduplicate_jobs(scanned_jobs)
		self._index_jobs(scanned_jobs)
		self._maybe_enqueue_transformation(len(scanned_jobs))

		weaviate_jobs = self._query_weaviate(profile)
		combined_jobs = self._deduplicate_jobs(scanned_jobs + weaviate_jobs)
		ranked = self._rank_jobs(profile, combined_jobs)

		result = {
			"profile": {
				"skills": profile["skills"],
				"age": profile["age"],
				"education": profile["education"],
				"city": profile["city"],
			},
			"results": ranked[: self.max_results],
			"source_status": source_status,
			"cache_hit": False,
		}
		self._cache_set(cache_key, result)
		return result

	def _validate_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
		if not isinstance(payload, dict):
			raise ValueError("Payload must be a JSON object")

		skills = payload.get("skills")
		age = payload.get("age")
		education = payload.get("education")
		city = payload.get("city")

		if not isinstance(skills, list) or not skills:
			raise ValueError("skills must be a non-empty list")
		if len(skills) > 20:
			raise ValueError("skills list is too large")

		normalized_skills = []
		for skill in skills:
			if not isinstance(skill, str):
				continue
			sanitized = self._sanitize_text(skill, max_len=64).lower()
			if sanitized:
				normalized_skills.append(sanitized)

		if not normalized_skills:
			raise ValueError("At least one valid skill is required")

		if age is None:
			raise ValueError("age is required")

		try:
			normalized_age = int(age)
		except Exception as exc:
			raise ValueError("age must be an integer") from exc

		if normalized_age < 14 or normalized_age > 80:
			raise ValueError("age must be between 14 and 80")

		if not isinstance(education, str) or not education.strip():
			raise ValueError("education must be a non-empty string")
		if not isinstance(city, str) or not city.strip():
			raise ValueError("city must be a non-empty string")

		normalized_education = self._sanitize_text(education, max_len=64).lower()
		normalized_city = self._sanitize_text(city, max_len=64)

		return {
			"skills": normalized_skills,
			"age": normalized_age,
			"education": normalized_education,
			"city": normalized_city,
		}

	def _build_cache_key(self, profile: Dict[str, Any]) -> str:
		serialized = json.dumps(profile, sort_keys=True, ensure_ascii=True)
		digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
		return f"job-search:{digest}"

	def _cache_get(self, cache_key: str) -> Optional[Dict[str, Any]]:
		if not self.cache:
			return None
		return self.cache.get_json(cache_key)

	def _cache_set(self, cache_key: str, value: Dict[str, Any]):
		if not self.cache:
			return
		self.cache.set_json(cache_key, value, ttl_seconds=self.cache_ttl)

	def _scan_sources(self, profile: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
		workers = max(1, min(self.max_workers, len(self.SUPPORTED_SOURCES)))
		fetchers = {
			"linkedin": self._fetch_linkedin_jobs,
			"indeed": self._fetch_indeed_jobs,
			"dev.bg": self._fetch_devbg_jobs,
			"jobs.bg": self._fetch_jobsbg_jobs,
		}

		jobs: List[Dict[str, Any]] = []
		status: Dict[str, Any] = {}
		start = time.monotonic()

		with ThreadPoolExecutor(max_workers=workers) as executor:
			future_map = {
				executor.submit(fetcher, profile): source
				for source, fetcher in fetchers.items()
			}

			try:
				for future in as_completed(future_map, timeout=self.total_timeout):
					source = future_map[future]
					try:
						source_jobs, source_state = future.result()
						jobs.extend(source_jobs)
						status[source] = source_state
					except Exception as exc:
						status[source] = {
							"state": "error",
							"reason": self._sanitize_text(str(exc), max_len=120),
						}
			except Exception:
				pass

			elapsed = time.monotonic() - start
			for future, source in future_map.items():
				if source in status:
					continue
				if future.done():
					try:
						source_jobs, source_state = future.result()
						jobs.extend(source_jobs)
						status[source] = source_state
					except Exception as exc:
						status[source] = {
							"state": "error",
							"reason": self._sanitize_text(str(exc), max_len=120),
						}
				else:
					status[source] = {
						"state": "timeout",
						"reason": f"Timed out after {elapsed:.1f}s",
					}

		return jobs, status

	def _fetch_linkedin_jobs(self, profile: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
		feed_url = os.getenv("LINKEDIN_JOBS_FEED_URL", "").strip()
		if not feed_url:
			return [], {
				"state": "skipped",
				"reason": "No compliant LinkedIn feed configured",
			}
		return self._fetch_source(feed_url, "linkedin", profile, feed_only=True)

	def _fetch_indeed_jobs(self, profile: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
		feed_url = os.getenv("INDEED_JOBS_FEED_URL", "").strip()
		if not feed_url:
			return [], {
				"state": "skipped",
				"reason": "No compliant Indeed feed configured",
			}
		return self._fetch_source(feed_url, "indeed", profile, feed_only=True)

	def _fetch_devbg_jobs(self, profile: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
		base_url = os.getenv("DEVBG_JOBS_URL", "https://dev.bg/jobs/")
		query = quote_plus(" ".join(profile["skills"]))
		city = quote_plus(profile["city"])
		url = f"{base_url}?q={query}&_job_location={city}"
		return self._fetch_source(url, "dev.bg", profile, feed_only=False)

	def _fetch_jobsbg_jobs(self, profile: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
		base_url = os.getenv("JOBSBG_SEARCH_URL", "https://www.jobs.bg/front_job_search.php")
		query = quote_plus(" ".join(profile["skills"]))
		city = quote_plus(profile["city"])
		url = f"{base_url}?keyword={query}&location={city}"
		return self._fetch_source(url, "jobs.bg", profile, feed_only=False)

	def _fetch_source(
		self,
		url: str,
		source: str,
		profile: Dict[str, Any],
		feed_only: bool,
	) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
		if not self._is_allowed_url(url):
			return [], {"state": "blocked", "reason": "Source blocked by policy"}

		if self.strict_compliance and source in {"linkedin", "indeed"} and not feed_only:
			return [], {"state": "blocked", "reason": "Non-feed scraping disabled"}

		try:
			response = self._http_get(url)
		except requests.Timeout:
			return [], {"state": "timeout", "reason": "Source request timed out"}
		except Exception as exc:
			return [], {
				"state": "error",
				"reason": self._sanitize_text(str(exc), max_len=120),
			}

		if response.status_code >= 400:
			return [], {
				"state": "error",
				"reason": f"HTTP {response.status_code}",
			}

		payload = response.text[:500_000]
		content_type = response.headers.get("Content-Type", "").lower()
		if feed_only or "xml" in content_type or payload.lstrip().startswith("<?xml"):
			parsed_jobs = self._parse_rss(payload, source)
		else:
			parsed_jobs = self._parse_html(payload, source, url)

		filtered_jobs = self._filter_jobs(parsed_jobs, profile)
		limited = filtered_jobs[: self.max_source_items]
		return limited, {"state": "ok", "count": len(limited)}

	def _http_get(self, url: str) -> requests.Response:
		domain = urlparse(url).netloc.lower()
		self._wait_for_domain_slot(domain)
		response = self.session.get(
			url,
			headers={"User-Agent": self.user_agent, "Accept": "text/html,application/xml"},
			timeout=self.request_timeout,
		)

		final_url = response.url or url
		if not self._is_allowed_url(final_url):
			raise ValueError("Redirected to disallowed URL")
		return response

	def _wait_for_domain_slot(self, domain: str):
		if self.min_domain_interval <= 0:
			return

		with self._domain_lock:
			now = time.monotonic()
			last_request = self._last_request_by_domain.get(domain, 0.0)
			wait_seconds = self.min_domain_interval - (now - last_request)
			if wait_seconds > 0:
				time.sleep(wait_seconds)
			self._last_request_by_domain[domain] = time.monotonic()

	def _parse_rss(self, payload: str, source: str) -> List[Dict[str, Any]]:
		jobs: List[Dict[str, Any]] = []
		try:
			root = ET.fromstring(payload)
		except Exception:
			return jobs

		item_nodes = root.findall(".//item")
		if not item_nodes:
			item_nodes = root.findall(".//{*}entry")

		for node in item_nodes[: self.max_source_items * 2]:
			title = self._get_xml_text(node, ["title", "{*}title"])
			link = self._get_xml_text(node, ["link", "{*}link"]) or self._get_xml_attr(
				node,
				["{*}link"],
				"href",
			)
			description = self._get_xml_text(node, ["description", "summary", "{*}summary"])
			posted_date = self._get_xml_text(node, ["pubDate", "updated", "{*}updated"])
			company = self._extract_company_from_text(description)
			location = self._extract_location_from_text(description)

			jobs.append(
				self._normalize_job(
					{
						"title": title,
						"company": company,
						"location": location,
						"salary": "",
						"job_url": link,
						"source": source,
						"posted_date": posted_date,
						"description": description,
					}
				)
			)
		return jobs

	def _parse_html(self, payload: str, source: str, base_url: str) -> List[Dict[str, Any]]:
		jobs: List[Dict[str, Any]] = []

		try:
			from bs4 import BeautifulSoup  # type: ignore

			soup = BeautifulSoup(payload, "html.parser")
			anchors = soup.find_all("a", href=True)
			for anchor in anchors[: self.max_source_items * 8]:
				title = self._sanitize_text(anchor.get_text(" ", strip=True), max_len=160)
				href = anchor.get("href", "")
				if isinstance(href, list):
					href = href[0] if href else ""
				if not title or len(title) < 3:
					continue

				job_url = urljoin(base_url, str(href))
				if not self._is_allowed_url(job_url):
					continue

				jobs.append(
					self._normalize_job(
						{
							"title": title,
							"company": "",
							"location": "",
							"salary": "",
							"job_url": job_url,
							"source": source,
							"posted_date": "",
							"description": "",
						}
					)
				)
		except Exception:
			links = re.findall(r"href=[\"']([^\"']+)[\"']", payload, flags=re.IGNORECASE)
			for href in links[: self.max_source_items * 8]:
				if "job" not in href.lower():
					continue
				job_url = urljoin(base_url, href)
				if not self._is_allowed_url(job_url):
					continue
				jobs.append(
					self._normalize_job(
						{
							"title": "Job Listing",
							"company": "",
							"location": "",
							"salary": "",
							"job_url": job_url,
							"source": source,
							"posted_date": "",
							"description": "",
						}
					)
				)

		return jobs

	def _filter_jobs(self, jobs: List[Dict[str, Any]], profile: Dict[str, Any]) -> List[Dict[str, Any]]:
		filtered: List[Dict[str, Any]] = []
		city_lower = profile["city"].lower()
		skill_set = set(profile["skills"])

		for job in jobs:
			title_desc = f"{job.get('title', '')} {job.get('description', '')}".lower()
			location = str(job.get("location", "")).lower()
			skill_overlap = sum(1 for skill in skill_set if skill in title_desc)

			if skill_overlap > 0 or city_lower in location:
				filtered.append(job)

		if filtered:
			return filtered
		return jobs

	def _rank_jobs(self, profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
		scored_jobs: List[Dict[str, Any]] = []

		for job in jobs:
			skill_score = self._score_skill_match(profile, job)
			city_score = self._score_city_match(profile, job)
			education_score = self._score_education_fit(profile, job)
			age_score = self._score_age_fit(profile, job)

			total = (
				0.55 * skill_score
				+ 0.20 * city_score
				+ 0.15 * education_score
				+ 0.10 * age_score
			)
			rounded = round(total, 4)

			enriched = dict(job)
			enriched["match_score"] = rounded
			enriched["match_explanation"] = (
				f"skill={skill_score:.2f}, city={city_score:.2f}, "
				f"education={education_score:.2f}, age_fit={age_score:.2f}"
			)
			scored_jobs.append(enriched)

		scored_jobs.sort(key=lambda item: item.get("match_score", 0.0), reverse=True)
		return scored_jobs

	def _score_skill_match(self, profile: Dict[str, Any], job: Dict[str, Any]) -> float:
		skills = profile["skills"]
		if not skills:
			return 0.0

		text = f"{job.get('title', '')} {job.get('description', '')}".lower()
		overlap = sum(1 for skill in skills if skill in text)
		return min(1.0, overlap / float(len(skills)))

	def _score_city_match(self, profile: Dict[str, Any], job: Dict[str, Any]) -> float:
		city = profile["city"].lower()
		location = str(job.get("location", "")).lower()
		if not location:
			return 0.4
		if city in location:
			return 1.0
		if "remote" in location:
			return 0.8
		return 0.2

	def _score_education_fit(self, profile: Dict[str, Any], job: Dict[str, Any]) -> float:
		ranking = {
			"high school": 1,
			"associate": 2,
			"bachelor": 3,
			"master": 4,
			"phd": 5,
		}
		profile_level = self._detect_education_level(profile.get("education", ""), ranking)
		job_level = self._detect_education_level(
			f"{job.get('title', '')} {job.get('description', '')}",
			ranking,
		)

		if job_level == 0:
			return 0.5
		if profile_level >= job_level:
			return 1.0
		return 0.3

	def _score_age_fit(self, profile: Dict[str, Any], job: Dict[str, Any]) -> float:
		text = f"{job.get('title', '')} {job.get('description', '')}".lower()
		match = re.search(r"(\d{2})\s*[-to]{1,3}\s*(\d{2})", text)
		if not match:
			return 0.5

		min_age = int(match.group(1))
		max_age = int(match.group(2))
		if min_age <= profile["age"] <= max_age:
			return 1.0
		return 0.2

	def _detect_education_level(self, text: str, ranking: Dict[str, int]) -> int:
		lower = str(text).lower()
		best = 0
		for label, value in ranking.items():
			if label in lower:
				best = max(best, value)
		return best

	def _normalize_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
		title = self._sanitize_text(str(job.get("title", "")), max_len=160)
		company = self._sanitize_text(str(job.get("company", "")), max_len=120)
		location = self._sanitize_text(str(job.get("location", "")), max_len=120)
		salary = self._sanitize_text(str(job.get("salary", "")), max_len=80)
		job_url = self._sanitize_text(str(job.get("job_url", "")), max_len=400)
		source = self._sanitize_text(str(job.get("source", "")), max_len=32).lower()
		posted_date = self._sanitize_text(str(job.get("posted_date", "")), max_len=64)
		description = self._sanitize_text(str(job.get("description", "")), max_len=2000)

		return {
			"title": title or "Unknown role",
			"company": company,
			"location": location,
			"salary": salary,
			"job_url": job_url,
			"source": source,
			"posted_date": posted_date,
			"description": description,
		}

	def _deduplicate_jobs(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
		unique: Dict[str, Dict[str, Any]] = {}
		for job in jobs:
			key = self._dedupe_key(job)
			existing = unique.get(key)
			if not existing:
				unique[key] = job
				continue

			old_len = len(existing.get("description", ""))
			new_len = len(job.get("description", ""))
			if new_len > old_len:
				unique[key] = job

		return list(unique.values())

	def _dedupe_key(self, job: Dict[str, Any]) -> str:
		job_url = str(job.get("job_url", "")).strip().lower()
		if job_url:
			parsed = urlparse(job_url)
			canonical = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
			return canonical

		title = str(job.get("title", "")).strip().lower()
		company = str(job.get("company", "")).strip().lower()
		source = str(job.get("source", "")).strip().lower()
		return f"{source}:{title}:{company}"

	def _build_allowed_domains(self) -> set:
		from_env = os.getenv("JOB_SOURCE_ALLOWLIST", "")
		if from_env.strip():
			return {entry.strip().lower() for entry in from_env.split(",") if entry.strip()}

		return {
			"linkedin.com",
			"www.linkedin.com",
			"indeed.com",
			"www.indeed.com",
			"dev.bg",
			"www.dev.bg",
			"jobs.bg",
			"www.jobs.bg",
		}

	def _is_allowed_url(self, url: str) -> bool:
		try:
			parsed = urlparse(url)
		except Exception:
			return False

		if parsed.scheme not in {"http", "https"}:
			return False

		domain = (parsed.hostname or "").lower()
		if not domain:
			return False
		if domain not in self.allowed_domains and not any(
			domain.endswith(f".{allowed}") for allowed in self.allowed_domains
		):
			return False

		try:
			resolved_ip = socket.gethostbyname(domain)
			parsed_ip = ipaddress.ip_address(resolved_ip)
			if parsed_ip.is_private or parsed_ip.is_loopback or parsed_ip.is_link_local:
				return False
		except Exception:
			return False

		return True

	def _sanitize_text(self, value: str, max_len: int = 120) -> str:
		cleaned = re.sub(r"\s+", " ", value).strip()
		if len(cleaned) > max_len:
			return cleaned[:max_len]
		return cleaned

	def _build_http_session(self) -> requests.Session:
		session = requests.Session()
		retries = Retry(
			total=2,
			backoff_factor=0.5,
			status_forcelist=[429, 500, 502, 503, 504],
			allowed_methods=frozenset(["GET"]),
		)
		adapter = HTTPAdapter(max_retries=retries)
		session.mount("http://", adapter)
		session.mount("https://", adapter)
		return session

	def _weaviate_inference_headers(self) -> Dict[str, str]:
		key = (
			os.getenv("WEAVIATE_INFERENCE_API_KEY", "").strip()
			or os.getenv("OPENAI_API_KEY", "").strip()
		)
		if not key:
			return {}
		return {"X-INFERENCE-PROVIDER-API-KEY": key}

	def _is_weaviate_cloud_deployment(self, url: str) -> bool:
		explicit = os.getenv("WEAVIATE_CLOUD", "").strip().lower()
		if explicit in ("1", "true", "yes"):
			return True
		if explicit in ("0", "false", "no"):
			return False
		u = (url or "").lower()
		return (
			"weaviate.network" in u
			or "wcs.api.weaviate.io" in u
			or "weaviate.cloud" in u
		)

	def _close_weaviate(self):
		try:
			if self.weaviate_client:
				self.weaviate_client.close()
		except Exception:
			pass

	def _build_weaviate_client(self):
		weaviate_url = os.getenv("WEAVIATE_URL", "").strip()
		if not weaviate_url:
			return None

		try:
			weaviate = importlib.import_module("weaviate")
			from weaviate.classes.init import Auth
		except Exception:
			return None

		api_key = os.getenv("WEAVIATE_API_KEY", "").strip()
		headers = self._weaviate_inference_headers()
		auth_creds = Auth.api_key(api_key) if api_key else None
		try:
			if self._is_weaviate_cloud_deployment(weaviate_url):
				return weaviate.connect_to_weaviate_cloud(
					cluster_url=weaviate_url,
					auth_credentials=auth_creds,
					headers=headers or None,
				)
			parsed = urlparse(weaviate_url)
			host = parsed.hostname
			if not host:
				return None
			http_secure = parsed.scheme == "https"
			if parsed.port is not None:
				http_port = parsed.port
			else:
				http_port = 443 if http_secure else 8080
			grpc_port = int(os.getenv("WEAVIATE_GRPC_PORT", "50051"))
			grpc_explicit = os.getenv("WEAVIATE_GRPC_SECURE", "").strip().lower()
			if grpc_explicit in ("1", "true", "yes"):
				grpc_secure = True
			elif grpc_explicit in ("0", "false", "no"):
				grpc_secure = False
			else:
				grpc_secure = http_secure
			return weaviate.connect_to_custom(
				http_host=host,
				http_port=http_port,
				http_secure=http_secure,
				grpc_host=host,
				grpc_port=grpc_port,
				grpc_secure=grpc_secure,
				auth_credentials=auth_creds,
				headers=headers or None,
			)
		except Exception:
			return None

	def _init_weaviate_agents(self):
		if not self.weaviate_client or not self.weaviate_cloud:
			return
		if self._is_truthy(os.getenv("WEAVIATE_DISABLE_AGENTS", "false")):
			return
		try:
			from weaviate.agents.classes import QueryAgentCollectionConfig
			from weaviate.agents.query import QueryAgent

			self.weaviate_query_agent = QueryAgent(
				client=self.weaviate_client,
				collections=[
					QueryAgentCollectionConfig(
						name="JobListing",
						view_properties=[
							"title",
							"company",
							"location",
							"salary",
							"job_url",
							"source",
							"posted_date",
							"description",
						],
					)
				],
			)
		except Exception:
			self.weaviate_query_agent = None

		try:
			from weaviate.agents.personalization import PersonalizationAgent
			from weaviate.classes.config import DataType

			ref = "JobListing"
			vec_name = os.getenv("WEAVIATE_VECTOR_NAME", "").strip() or None
			if PersonalizationAgent.exists(self.weaviate_client, ref):
				self.weaviate_personalization_agent = PersonalizationAgent.connect(
					client=self.weaviate_client,
					reference_collection=ref,
					vector_name=vec_name,
				)
			else:
				self.weaviate_personalization_agent = PersonalizationAgent.create(
					client=self.weaviate_client,
					reference_collection=ref,
					vector_name=vec_name,
					user_properties={
						"age": DataType.NUMBER,
						"skills": DataType.TEXT_ARRAY,
						"city": DataType.TEXT,
						"education": DataType.TEXT,
					},
				)
		except Exception:
			self.weaviate_personalization_agent = None

	def _ensure_weaviate_schema(self):
		if not self.weaviate_client:
			return

		try:
			from weaviate.classes.config import Configure, DataType, Property

			if self.weaviate_client.collections.exists("JobListing"):
				return

			self.weaviate_client.collections.create(
				name="JobListing",
				properties=[
					Property(name="title", data_type=DataType.TEXT),
					Property(name="company", data_type=DataType.TEXT),
					Property(name="location", data_type=DataType.TEXT),
					Property(name="salary", data_type=DataType.TEXT),
					Property(name="job_url", data_type=DataType.TEXT),
					Property(name="source", data_type=DataType.TEXT),
					Property(name="posted_date", data_type=DataType.TEXT),
					Property(name="description", data_type=DataType.TEXT),
				],
				vectorizer_config=Configure.Vectorizer.text2vec_openai(),
			)
		except Exception:
			pass

	def _index_jobs(self, jobs: List[Dict[str, Any]]):
		if not self.weaviate_client or not jobs:
			return

		try:
			collection = self.weaviate_client.collections.get("JobListing")
			with collection.batch.fixed_size(batch_size=20) as batch:
				for job in jobs[:200]:
					payload = {
						"title": job.get("title", ""),
						"company": job.get("company", ""),
						"location": job.get("location", ""),
						"salary": job.get("salary", ""),
						"job_url": job.get("job_url", ""),
						"source": job.get("source", ""),
						"posted_date": job.get("posted_date", ""),
						"description": job.get("description", ""),
					}
					batch.add_object(properties=payload)
		except Exception:
			pass

	def _maybe_enqueue_transformation(self, indexed_count: int):
		if (
			not self.weaviate_client
			or not self.weaviate_cloud
			or indexed_count <= 0
			or not self._is_truthy(os.getenv("WEAVIATE_ENABLE_TRANSFORMATION_AGENT", "false"))
		):
			return

		def run():
			try:
				from weaviate.agents.classes import Operations
				from weaviate.agents.transformation import TransformationAgent
				from weaviate.classes.config import DataType

				op = Operations.append_property(
					property_name="vocanta_role_summary",
					data_type=DataType.TEXT,
					view_properties=["title", "description"],
					instruction=(
						"In one short professional phrase (max 12 words), describe the primary role or specialty."
					),
				)
				t_agent = TransformationAgent(
					client=self.weaviate_client,
					collection="JobListing",
					operations=[op],
				)
				t_agent.update_all()
			except Exception:
				pass

		with self._transformation_lock:
			if self._transformation_thread and self._transformation_thread.is_alive():
				return
			self._transformation_thread = threading.Thread(target=run, daemon=True)
			self._transformation_thread.start()

	def _profile_to_nl_query(self, profile: Dict[str, Any]) -> str:
		skills = " ".join(profile["skills"])
		return (
			f"Relevant jobs for skills: {skills}. "
			f"Location preference: {profile['city']}. "
			f"Education: {profile['education']}."
		)

	def _persona_uuid_for_profile(self, profile: Dict[str, Any]) -> uuid.UUID:
		serialized = json.dumps(profile, sort_keys=True, ensure_ascii=True)
		return uuid.uuid5(uuid.NAMESPACE_URL, f"vocanta:{serialized}")

	def _upsert_persona_for_personalization(self, persona_id: uuid.UUID, profile: Dict[str, Any]):
		pa = self.weaviate_personalization_agent
		if not pa:
			return
		from weaviate.agents.classes import Persona

		persona = Persona(
			persona_id=persona_id,
			properties={
				"age": profile["age"],
				"skills": profile["skills"],
				"city": profile["city"],
				"education": profile["education"],
			},
		)
		if pa.has_persona(persona_id):
			pa.update_persona(persona)
		else:
			pa.add_persona(persona)

	def _job_from_weaviate_object(self, obj: Any) -> Optional[Dict[str, Any]]:
		props = getattr(obj, "properties", None)
		if props is None and isinstance(obj, dict):
			props = obj
		if not isinstance(props, dict):
			return None
		return self._normalize_job(
			{
				"title": props.get("title", ""),
				"company": props.get("company", ""),
				"location": props.get("location", ""),
				"salary": props.get("salary", ""),
				"job_url": props.get("job_url", ""),
				"source": props.get("source", "weaviate"),
				"posted_date": props.get("posted_date", ""),
				"description": props.get("description", ""),
			}
		)

	def _query_weaviate_near_text_fallback(self, query_terms: str) -> List[Dict[str, Any]]:
		if not self.weaviate_client:
			return []
		collection = self.weaviate_client.collections.get("JobListing")
		response = collection.query.near_text(
			query=query_terms,
			limit=self.max_results * 3,
			return_properties=[
				"title",
				"company",
				"location",
				"salary",
				"job_url",
				"source",
				"posted_date",
				"description",
			],
		)
		jobs: List[Dict[str, Any]] = []
		for obj in response.objects:
			parsed = self._job_from_weaviate_object(obj)
			if parsed:
				jobs.append(parsed)
		return jobs

	def _query_weaviate(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
		if not self.weaviate_client:
			return []

		query_terms = " ".join(profile["skills"] + [profile["city"], profile["education"]])
		nl = self._profile_to_nl_query(profile)
		seen: set = set()
		out: List[Dict[str, Any]] = []

		def add_job(job: Optional[Dict[str, Any]]) -> None:
			if not job:
				return
			key = self._dedupe_key(job)
			if key in seen:
				return
			seen.add(key)
			out.append(job)

		if self.weaviate_personalization_agent:
			try:
				persona_id = self._persona_uuid_for_profile(profile)
				self._upsert_persona_for_personalization(persona_id, profile)
				strength = float(os.getenv("WEAVIATE_PERSONALIZATION_STRENGTH", "0.85"))
				pq = self.weaviate_personalization_agent.query(
					persona_id=persona_id,
					strength=strength,
					overfetch_factor=2.0,
				)
				presp = pq.near_text(query=nl, limit=self.max_results * 3)
				for obj in presp.objects:
					add_job(self._job_from_weaviate_object(obj))
			except Exception:
				pass

		if self.weaviate_query_agent:
			try:
				search_response = self.weaviate_query_agent.search(nl, limit=self.max_results * 3)
				for obj in search_response.search_results.objects:
					add_job(self._job_from_weaviate_object(obj))
			except Exception:
				pass

		if len(out) < self.max_results:
			try:
				for job in self._query_weaviate_near_text_fallback(query_terms):
					add_job(job)
			except Exception:
				pass

		return out

	def _extract_company_from_text(self, text: str) -> str:
		if not text:
			return ""
		match = re.search(r"company\s*[:\-]\s*([^\n\r|]+)", text, flags=re.IGNORECASE)
		if match:
			return self._sanitize_text(match.group(1), max_len=120)
		return ""

	def _extract_location_from_text(self, text: str) -> str:
		if not text:
			return ""
		match = re.search(r"location\s*[:\-]\s*([^\n\r|]+)", text, flags=re.IGNORECASE)
		if match:
			return self._sanitize_text(match.group(1), max_len=120)
		return ""

	def _get_xml_text(self, node: ET.Element, tags: List[str]) -> str:
		for tag in tags:
			child = node.find(tag)
			if child is not None and child.text:
				return self._sanitize_text(child.text, max_len=2000)
		return ""

	def _get_xml_attr(self, node: ET.Element, tags: List[str], attr: str) -> str:
		for tag in tags:
			child = node.find(tag)
			if child is not None and child.attrib.get(attr):
				return self._sanitize_text(child.attrib[attr], max_len=400)
		return ""

	def _is_truthy(self, value: str) -> bool:
		return str(value).strip().lower() in {"1", "true", "yes", "on"}
