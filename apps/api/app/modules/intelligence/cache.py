from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Any

from app.core.redis import redis_client

logger = logging.getLogger(__name__)


class IntelligenceCache:
    """
    Manages dual-namespace Redis caching for semantic queries and recommendations.
    Provides memory fallback when Redis is unreachable.
    """

    SEMANTIC_PREFIX = "cg:semantic"
    RECOMMENDATION_PREFIX = "cg:recommendations"
    DEFAULT_TTL = 900  # 15 minutes

    def __init__(self) -> None:
        self._memory_cache: dict[str, tuple[str, float]] = {}

    def _hash_key(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

    def get_semantic(self, model: str, locale: str, query: str) -> dict[str, Any] | None:
        key = f"{self.SEMANTIC_PREFIX}:{model}:{locale}:{self._hash_key(query)}"
        try:
            val = redis_client.get(key)
            if val:
                return json.loads(val)
        except Exception:
            pass

        # Memory cache fallback
        if key in self._memory_cache:
            data_str, expires_at = self._memory_cache[key]
            if time.time() < expires_at:
                return json.loads(data_str)
            else:
                del self._memory_cache[key]
        return None

    def set_semantic(self, model: str, locale: str, query: str, data: dict[str, Any], ttl: int = DEFAULT_TTL) -> None:
        key = f"{self.SEMANTIC_PREFIX}:{model}:{locale}:{self._hash_key(query)}"
        data_str = json.dumps(data)
        try:
            redis_client.setex(key, ttl, data_str)
            return
        except Exception:
            pass

        self._memory_cache[key] = (data_str, time.time() + ttl)

    def get_recommendations(self, content_id: str, locale: str) -> list[dict[str, Any]] | None:
        key = f"{self.RECOMMENDATION_PREFIX}:{content_id}:{locale}"
        try:
            val = redis_client.get(key)
            if val:
                return json.loads(val)
        except Exception:
            pass

        if key in self._memory_cache:
            data_str, expires_at = self._memory_cache[key]
            if time.time() < expires_at:
                return json.loads(data_str)
            else:
                del self._memory_cache[key]
        return None

    def set_recommendations(self, content_id: str, locale: str, data: list[dict[str, Any]], ttl: int = DEFAULT_TTL) -> None:
        key = f"{self.RECOMMENDATION_PREFIX}:{content_id}:{locale}"
        data_str = json.dumps(data)
        try:
            redis_client.setex(key, ttl, data_str)
            return
        except Exception:
            pass

        self._memory_cache[key] = (data_str, time.time() + ttl)

    def invalidate_for_content(self, content_id: str) -> None:
        """Purges cached recommendations for a specific content entry across all locales."""
        try:
            keys = redis_client.keys(f"{self.RECOMMENDATION_PREFIX}:{content_id}:*")
            if keys:
                redis_client.delete(*keys)
        except Exception:
            pass

        prefix = f"{self.RECOMMENDATION_PREFIX}:{content_id}:"
        to_del = [k for k in self._memory_cache if k.startswith(prefix)]
        for k in to_del:
            self._memory_cache.pop(k, None)
