from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pathlib import Path

from data.redis_cache import RedisCache
from routes.auth_routes import auth_bp
from routes.job_agent import job_agent_bp

def _load_env():
	server_dir = Path(__file__).resolve().parent
	project_root = server_dir.parent

	load_dotenv(project_root / ".env")
	load_dotenv(server_dir / ".env", override=False)


_load_env()
app = Flask(__name__)
CORS(app)

app.config["JOB_AGENT_CACHE"] = None  

app.register_blueprint(auth_bp)
app.register_blueprint(job_agent_bp)

redis_url = os.getenv("REDIS_URL")
cache = RedisCache(redis_url=redis_url)

if __name__ == "__main__":
	host = os.getenv("APP_HOST", "0.0.0.0")
	port = int(os.getenv("APP_PORT", "5000"))
	debug = os.getenv("APP_DEBUG", "false").strip().lower() == "true"
	app.run(host=host, port=port, debug=debug)
