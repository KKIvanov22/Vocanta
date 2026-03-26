import json
import importlib
import os
from typing import Any, Optional

try:
    redis = importlib.import_module("redis")
except Exception:  
    redis = None


class RedisCache:

    def __init__(
        self,
        redis_url: Optional[str] = None,
        host: Optional[str] = None,
        port: Optional[int] = None,
        db: Optional[int] = None,
        password: Optional[str] = None,
        socket_timeout: float = 2.0,
    ):
        self.client = None
        if redis is None:
            return

        try:
            if redis_url:
                self.client = redis.Redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_timeout=socket_timeout,
                )
            else:
                resolved_host = host or os.getenv("REDIS_HOST", "127.0.0.1")
                resolved_port = int(port or os.getenv("REDIS_PORT", "6379"))
                resolved_db = int(db or os.getenv("REDIS_DB", "0"))
                resolved_password = password or os.getenv("REDIS_PASSWORD")

                self.client = redis.Redis(
                    host=resolved_host,
                    port=resolved_port,
                    db=resolved_db,
                    password=resolved_password,
                    decode_responses=True,
                    socket_timeout=socket_timeout,
                )

            self.client.ping()
        except Exception:
            self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    def get_json(self, key: str) -> Optional[Any]:
        if not self.client:
            return None

        try:
            payload = self.client.get(key)
            if not payload:
                return None
            return json.loads(payload)
        except Exception:
            return None

    def set_json(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        if not self.client:
            return False

        try:
            payload = json.dumps(value, ensure_ascii=True)
            self.client.setex(key, ttl_seconds, payload)
            return True
        except Exception:
            return False

    def delete(self, key: str) -> bool:
        if not self.client:
            return False

        try:
            self.client.delete(key)
            return True
        except Exception:
            return False

    def close(self):
        if not self.client:
            return

        try:
            self.client.close()
        except Exception:
            pass
