from __future__ import annotations

import json
import logging
from typing import Any

from app.core.redis import redis_client

logger = logging.getLogger(__name__)


class PublicContentCache:
    PREFIX = "cg:public-content:"
    DEFAULT_TTL = 300  # 5 minutes

    def key(self, slug: str, locale: str) -> str:
        return f"{self.PREFIX}{locale}:{slug}"

    def encode(self, value: dict[str, Any]) -> str:
        return json.dumps(value, ensure_ascii=False)

    def decode(self, value: str) -> dict[str, Any]:
        return json.loads(value)

    def get(self, slug: str, locale: str) -> dict[str, Any] | None:
        try:
            raw = redis_client.get(self.key(slug, locale))
            if raw:
                return self.decode(raw)
        except Exception as exc:
            logger.warning("PublicContentCache get error for %s (%s): %s", slug, locale, exc)
        return None

    def set(
        self,
        slug: str,
        locale: str,
        value: dict[str, Any],
        ttl: int = DEFAULT_TTL,
    ) -> None:
        try:
            encoded = self.encode(value)
            redis_client.setex(self.key(slug, locale), ttl, encoded)
        except Exception as exc:
            logger.warning("PublicContentCache set error for %s (%s): %s", slug, locale, exc)

    def invalidate(self, slug: str) -> None:
        """Invalidate cached entries for this slug across all locales."""
        locales = ["en", "hi", "chg"]
        try:
            keys = [self.key(slug, loc) for loc in locales]
            redis_client.delete(*keys)
        except Exception as exc:
            logger.warning("PublicContentCache invalidate error for %s: %s", slug, exc)
