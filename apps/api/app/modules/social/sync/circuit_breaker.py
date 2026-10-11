from __future__ import annotations

import logging
import threading
import time
from enum import Enum
from typing import Any

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.domain.errors import CircuitBreakerOpenError

logger = logging.getLogger(__name__)


class CircuitState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class ProviderCircuitBreaker:
    """Tracks consecutive provider failures and prevents hammering during outages."""

    def __init__(
        self,
        failure_threshold: int = 5,
        cooldown_seconds: float = 300.0,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self._mutex = threading.Lock()

        # State tracking per platform: platform_str -> dict
        self._stats: dict[str, dict[str, Any]] = {}

    def _get_platform_key(self, platform: SocialPlatform | str) -> str:
        return platform.value if hasattr(platform, "value") else str(platform).lower()

    def _get_or_create(self, key: str) -> dict[str, Any]:
        if key not in self._stats:
            self._stats[key] = {
                "state": CircuitState.CLOSED,
                "consecutive_failures": 0,
                "opened_at": None,
                "last_error": None,
            }
        return self._stats[key]

    def can_execute(self, platform: SocialPlatform | str) -> bool:
        key = self._get_platform_key(platform)
        now = time.monotonic()

        with self._mutex:
            entry = self._get_or_create(key)
            state = entry["state"]

            if state == CircuitState.CLOSED:
                return True

            if state == CircuitState.OPEN:
                opened_at = entry.get("opened_at") or 0
                if now - opened_at >= self.cooldown_seconds:
                    # Transition to HALF_OPEN to allow trial execution
                    entry["state"] = CircuitState.HALF_OPEN
                    logger.info("Circuit breaker for %s transitioned to HALF_OPEN (probing)", key)
                    return True
                return False

            if state == CircuitState.HALF_OPEN:
                # Probing trial
                return True

            return False

    def assert_can_execute(self, platform: SocialPlatform | str) -> None:
        if not self.can_execute(platform):
            key = self._get_platform_key(platform)
            entry = self._stats.get(key, {})
            last_err = entry.get("last_error")
            raise CircuitBreakerOpenError(
                f"Circuit breaker is OPEN for platform '{key}' due to consecutive failures. "
                f"Cooldown active. Last error: {last_err}"
            )

    def record_success(self, platform: SocialPlatform | str) -> None:
        key = self._get_platform_key(platform)
        with self._mutex:
            entry = self._get_or_create(key)
            if entry["state"] != CircuitState.CLOSED:
                logger.info("Circuit breaker for %s recovered and transitioned to CLOSED", key)
            entry["state"] = CircuitState.CLOSED
            entry["consecutive_failures"] = 0
            entry["opened_at"] = None
            entry["last_error"] = None

    def record_failure(self, platform: SocialPlatform | str, error: Exception | None = None) -> None:
        key = self._get_platform_key(platform)
        now = time.monotonic()

        with self._mutex:
            entry = self._get_or_create(key)
            entry["consecutive_failures"] += 1
            entry["last_error"] = str(error) if error else "Unknown error"

            if entry["consecutive_failures"] >= self.failure_threshold:
                entry["state"] = CircuitState.OPEN
                entry["opened_at"] = now
                logger.warning(
                    "Circuit breaker for %s tripped to OPEN after %d consecutive failures",
                    key,
                    entry["consecutive_failures"],
                )

    def reset(self, platform: SocialPlatform | str | None = None) -> None:
        with self._mutex:
            if platform:
                key = self._get_platform_key(platform)
                self._stats.pop(key, None)
            else:
                self._stats.clear()


__all__ = ["ProviderCircuitBreaker", "CircuitState"]
