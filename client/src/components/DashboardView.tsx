"use client";

import { useState, FormEvent } from "react";
import {
  Search,
  Sparkles,
  Briefcase,
  User,
  MapPin,
  GraduationCap,
  Calendar,
  Tag,
} from "lucide-react";
import { JobCard, type Job } from "@/components/JobCard";

type ApiJob = {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  description?: string;
  job_url?: string;
  source?: string;
  posted_date?: string;
  match_score?: number;
};

type SearchSuccess = {
  status: "success";
  data: {
    results: ApiJob[];
    profile?: { skills?: string[] };
  };
};

function formatSourceLabel(source: string): string {
  if (!source) return "Listing";
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function stableJobId(job: ApiJob, index: number): string {
  const url = String(job.job_url ?? "").trim();
  if (url) {
    let h = 0;
    for (let i = 0; i < url.length; i++) {
      h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
    }
    return `u${Math.abs(h).toString(36)}`;
  }
  const title = String(job.title ?? "");
  const company = String(job.company ?? "");
  const src = String(job.source ?? "");
  let h = 0;
  const s = `${src}|${title}|${company}|${index}`;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `j${Math.abs(h).toString(36)}`;
}

function skillsMentionedInJob(job: ApiJob, profileSkills: string[]): string[] {
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  return profileSkills.filter((skill) => text.includes(skill.toLowerCase()));
}

function mapResultsToJobs(
  results: ApiJob[],
  profileSkills: string[],
): Job[] {
  return results.map((raw, index) => {
    const scoreRaw = raw.match_score;
    const matchScore =
      typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
        ? Math.round(Math.min(1, Math.max(0, scoreRaw)) * 100)
        : 0;
    const salary = String(raw.salary ?? "").trim();
    return {
      id: stableJobId(raw, index),
      title: String(raw.title ?? "Unknown role"),
      company: String(raw.company ?? "").trim() || "Company not listed",
      location: String(raw.location ?? "").trim() || "Location not listed",
      salary: salary || "Not listed",
      type: formatSourceLabel(String(raw.source ?? "")),
      description: String(raw.description ?? "").trim() || "No description available.",
      skills: skillsMentionedInJob(raw, profileSkills),
      matchScore,
    };
  });
}

export function DashboardView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const ageRaw = String(fd.get("age") ?? "").trim();
    const city = String(fd.get("city") ?? "").trim();
    const education = String(fd.get("education") ?? "").trim();
    const skillsText = String(fd.get("skills") ?? "").trim();

    const skills = skillsText
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const age = parseInt(ageRaw, 10);
    if (!skills.length) {
      setError("Please enter at least one skill.");
      setLoading(false);
      return;
    }
    if (!ageRaw || Number.isNaN(age)) {
      setError("Please enter a valid age.");
      setLoading(false);
      return;
    }
    if (!education) {
      setError("Please select your education level.");
      setLoading(false);
      return;
    }
    if (!city) {
      setError("Please enter your city.");
      setLoading(false);
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          age,
          education,
          city,
        }),
      });
    } catch {
      setError("Network error. Try again.");
      setHasSearched(true);
      setJobs([]);
      setLoading(false);
      return;
    }

    const json = (await res.json().catch(() => ({}))) as
      | SearchSuccess
      | { status?: string; message?: string; type?: string };

    setHasSearched(true);

    if (res.status === 401) {
      setJobs([]);
      setError("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    if (!res.ok || json.status !== "success" || !("data" in json)) {
      const msg =
        typeof json === "object" &&
        json !== null &&
        "message" in json &&
        typeof (json as { message: unknown }).message === "string"
          ? (json as { message: string }).message
          : "Job search failed. Try again.";
      setJobs([]);
      setError(msg);
      setLoading(false);
      return;
    }

    const profileSkills = json.data.profile?.skills ?? skills;
    const list = Array.isArray(json.data.results) ? json.data.results : [];
    setJobs(mapResultsToJobs(list, profileSkills));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="size-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Job Matcher</h1>
          </div>
          <p className="text-blue-100 text-sm ml-[52px]">
            Tell us about yourself and we&apos;ll find the perfect jobs for you
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Profile Form ── */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm shadow-gray-100">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-7">
              <div className="size-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <User className="size-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">Your Profile</h2>
                <p className="text-xs text-gray-400">Help us understand your background</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Age */}
                <div>
                  <label
                    htmlFor="age"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                  >
                    <Calendar className="size-3.5 text-blue-500" />
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="e.g. 25"
                    min={18}
                    max={100}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                  >
                    <MapPin className="size-3.5 text-blue-500" />
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. San Francisco"
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Education */}
              <div>
                <label
                  htmlFor="education"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                >
                  <GraduationCap className="size-3.5 text-blue-500" />
                  Education
                </label>
                <select
                  id="education"
                  name="education"
                  defaultValue=""
                  className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none"
                >
                  <option value="" disabled>Select your education level</option>
                  <option value="high-school">High School</option>
                  <option value="associate">Associate Degree</option>
                  <option value="bachelor">Bachelor&apos;s Degree</option>
                  <option value="master">Master&apos;s Degree</option>
                  <option value="phd">PhD</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="self-taught">Self-Taught</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label
                  htmlFor="skills"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                >
                  <Tag className="size-3.5 text-blue-500" />
                  Skills
                  <span className="text-blue-500 ml-0.5">*</span>
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={3}
                  placeholder="e.g. React, TypeScript, Node.js, Python, Design..."
                  required
                  className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">Separate skills with commas</p>
              </div>

              {error && (
                <p
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 transition-all disabled:opacity-60 disabled:pointer-events-none"
              >
                <Search className="size-4" />
                {loading ? "Searching…" : "Find Matching Jobs"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Results ── */}
        {hasSearched && jobs.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Matched Jobs</h2>
              <p className="text-sm text-gray-500 mt-1">
                Found {jobs.length} job{jobs.length !== 1 ? "s" : ""} matching your skills
              </p>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* ── No results ── */}
        {hasSearched && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center size-16 bg-gray-100 rounded-2xl mb-4">
              <Search className="size-7 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No matching jobs found</h3>
            <p className="text-sm text-gray-500">Try different skills or broader search terms</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!hasSearched && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center size-20 bg-blue-50 border border-blue-100 rounded-3xl mb-5">
              <Briefcase className="size-9 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Start your job search</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Fill out your profile above and let our AI match you with the best opportunities
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
