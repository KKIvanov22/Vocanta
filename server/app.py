from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pathlib import Path

from agent.agent import Agent
from data.redis_cache import RedisCache


def _load_env():
	server_dir = Path(__file__).resolve().parent
	project_root = server_dir.parent

	load_dotenv(project_root / ".env")
	load_dotenv(server_dir / ".env", override=False)


_load_env()

app = Flask(__name__)
CORS(app)

redis_url = os.getenv("REDIS_URL")
cache = RedisCache(redis_url=redis_url)
agent = Agent(cache=cache)


@app.get("/health")
def health_check():
	return jsonify(
		{
			"status": "ok",
			"cache_available": cache.is_available(),
			"weaviate_available": bool(agent.weaviate_client),
		}
	)


@app.post("/jobs/search")
def search_jobs():
	payload = request.get_json(silent=True)
	if payload is None:
		return jsonify({"error": "Request body must be valid JSON"}), 400

	try:
		result = agent.search_jobs(payload)
		return jsonify(result)
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	except Exception:
		return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
	host = os.getenv("APP_HOST", "0.0.0.0")
	port = int(os.getenv("APP_PORT", "5000"))
	debug = os.getenv("APP_DEBUG", "false").strip().lower() == "true"
	app.run(host=host, port=port, debug=debug)
