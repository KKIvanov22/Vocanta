from flask import Blueprint, request, jsonify, current_app
from typing import Any, Dict

from agent.agent import Agent

job_agent_bp = Blueprint("job_agent", __name__, url_prefix="/api/jobs")


def get_agent() -> Agent:

    if "job_agent_instance" not in current_app.config:
        cache = current_app.config.get("JOB_AGENT_CACHE")  
        current_app.config["job_agent_instance"] = Agent(cache=cache)
    return current_app.config["job_agent_instance"]


@job_agent_bp.route("/search", methods=["POST"])
def search_jobs():
    agent = get_agent()

    try:
        payload: Dict[str, Any] = request.get_json(force=True)

        result = agent.search_jobs(payload)

        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except ValueError as e:
        return jsonify({
            "status": "error",
            "type": "validation_error",
            "message": str(e)
        }), 400

    except Exception as e:
        current_app.logger.exception("Job search failed")

        return jsonify({
            "status": "error",
            "type": "internal_error",
            "message": "Something went wrong"
        }), 500


@job_agent_bp.route("/health", methods=["GET"])
def health():
    agent = get_agent()

    return jsonify({
        "status": "ok",
        "agent": {
            "sources": agent.SUPPORTED_SOURCES,
            "weaviate_enabled": bool(agent.weaviate_client),
            "personalization_enabled": bool(agent.weaviate_personalization_agent),
        }
    })


@job_agent_bp.route("/sources", methods=["GET"])
def sources():
    agent = get_agent()

    return jsonify({
        "status": "success",
        "data": {
            "supported_sources": agent.SUPPORTED_SOURCES,
            "strict_compliance": agent.strict_compliance,
            "allowed_domains": list(agent.allowed_domains),
        }
    })


@job_agent_bp.route("/config", methods=["GET"])
def config():
    agent = get_agent()

    return jsonify({
        "status": "success",
        "data": {
            "timeouts": {
                "request_timeout": agent.request_timeout,
                "total_timeout": agent.total_timeout,
            },
            "limits": {
                "max_workers": agent.max_workers,
                "max_results": agent.max_results,
                "max_source_items": agent.max_source_items,
            },
            "cache": {
                "enabled": bool(agent.cache),
                "ttl": agent.cache_ttl,
            }
        }
    })


@job_agent_bp.route("/clear-cache", methods=["POST"])
def clear_cache():
    agent = get_agent()

    if not agent.cache:
        return jsonify({
            "status": "error",
            "message": "Cache is not enabled"
        }), 400

    try:
        agent.cache.clear()
        return jsonify({
            "status": "success",
            "message": "Cache cleared"
        })
    except Exception:
        return jsonify({
            "status": "error",
            "message": "Failed to clear cache"
        }), 500