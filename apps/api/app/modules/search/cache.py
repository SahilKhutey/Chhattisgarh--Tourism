from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

from app.core.redis import redis_client

logger = logging.getLogger(__name__)


def build_cache_key(payload: dict[str, Any]) -> str:
    """Creates a deterministic SHA-256 hash key for search requests and parameters."""
    normalized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"cg:search:{digest}"


class SearchCache:
    PREFIX = "cg:search:"
    DEFAULT_TTL = 60  # 60 seconds
    _local_cache: dict[str, tuple[float, dict[str, Any]]] = {}

    def get(self, key: str) -> dict[str, Any] | None:
        try:
            raw = redis_client.get(key)
            if raw:
                return json.loads(raw)
        except Exception:
            pass

        # Fallback to in-memory cache
        import time
        cached = self._local_cache.get(key)
        if cached:
            exp_time, val = cached
            if time.time() < exp_time:
                return val
            self._local_cache.pop(key, None)
        return None

    def set(self, key: str, value: dict[str, Any], ttl: int = DEFAULT_TTL) -> None:
        import time
        self._local_cache[key] = (time.time() + ttl, value)
        try:
            encoded = json.dumps(value, ensure_ascii=False)
            redis_client.setex(key, ttl, encoded)
        except Exception:
            pass

    def invalidate_all(self) -> None:
        """Flushes cached search queries."""
        self._local_cache.clear()
        try:
            keys = redis_client.keys(f"{self.PREFIX}*")
            if keys:
                redis_client.delete(*keys)
        except Exception:
            pass
