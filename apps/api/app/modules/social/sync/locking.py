from __future__ import annotations

import logging
import threading
import time
import uuid
from contextlib import contextmanager
from typing import Any, Generator, Protocol

from app.modules.social.domain.errors import SocialSyncLockConflictError

logger = logging.getLogger(__name__)

_REDIS_RELEASE_LUA = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""


class SocialSyncLock(Protocol):
    """Protocol defining distributed lock operations for account synchronization."""

    def acquire(self, account_id: uuid.UUID | str, ttl_seconds: int = 300) -> bool:
        ...

    def release(self, account_id: uuid.UUID | str) -> None:
        ...

    def is_locked(self, account_id: uuid.UUID | str) -> bool:
        ...

    @contextmanager
    def lock(
        self, account_id: uuid.UUID | str, ttl_seconds: int = 300
    ) -> Generator[str, None, None]:
        ...


class InMemorySocialSyncLock:
    """Thread-safe in-memory lock implementation for tests and standalone environments."""

    def __init__(self) -> None:
        self._mutex = threading.Lock()
        self._locks: dict[str, tuple[str, float]] = {}  # key -> (token, expire_timestamp)

    def _cleanup_expired(self, now: float) -> None:
        expired_keys = [k for k, (_, exp) in self._locks.items() if exp <= now]
        for k in expired_keys:
            del self._locks[k]

    def acquire(self, account_id: uuid.UUID | str, ttl_seconds: int = 300) -> bool:
        key = str(account_id)
        now = time.monotonic()
        with self._mutex:
            self._cleanup_expired(now)
            if key in self._locks:
                return False

            token = uuid.uuid4().hex
            self._locks[key] = (token, now + ttl_seconds)
            return True

    def release(self, account_id: uuid.UUID | str) -> None:
        key = str(account_id)
        with self._mutex:
            self._locks.pop(key, None)

    def is_locked(self, account_id: uuid.UUID | str) -> bool:
        key = str(account_id)
        now = time.monotonic()
        with self._mutex:
            self._cleanup_expired(now)
            return key in self._locks

    @contextmanager
    def lock(
        self, account_id: uuid.UUID | str, ttl_seconds: int = 300
    ) -> Generator[str, None, None]:
        acquired = self.acquire(account_id, ttl_seconds=ttl_seconds)
        if not acquired:
            raise SocialSyncLockConflictError(
                f"Concurrent sync lock conflict for social account: {account_id}"
            )
        try:
            yield str(account_id)
        finally:
            self.release(account_id)


class RedisSocialSyncLock:
    """Production Redis-backed distributed lock with safe Lua token release."""

    def __init__(self, redis_client: Any | None = None) -> None:
        self._client = redis_client
        self._local_tokens: dict[str, str] = {}
        self._mutex = threading.Lock()

    def _get_client(self) -> Any:
        if self._client is not None:
            return self._client
        try:
            from app.core.redis import get_redis_client
            return get_redis_client()
        except Exception:
            return None

    def _key(self, account_id: uuid.UUID | str) -> str:
        return f"social:sync:{account_id}"

    def acquire(self, account_id: uuid.UUID | str, ttl_seconds: int = 300) -> bool:
        client = self._get_client()
        if client is None:
            logger.warning("Redis client unavailable; falling back to permissive acquire.")
            return True

        key = self._key(account_id)
        token = uuid.uuid4().hex

        try:
            # SET social:sync:{id} {token} NX EX {ttl_seconds}
            res = client.set(key, token, nx=True, ex=ttl_seconds)
            if res:
                with self._mutex:
                    self._local_tokens[str(account_id)] = token
                return True
            return False
        except Exception as exc:
            logger.error("Failed to acquire Redis sync lock for %s: %s", account_id, exc)
            return False

    def release(self, account_id: uuid.UUID | str) -> None:
        client = self._get_client()
        if client is None:
            return

        key = self._key(account_id)
        with self._mutex:
            token = self._local_tokens.pop(str(account_id), None)

        if not token:
            return

        try:
            client.eval(_REDIS_RELEASE_LUA, 1, key, token)
        except Exception as exc:
            logger.warning("Failed to release Redis sync lock for %s: %s", account_id, exc)

    def is_locked(self, account_id: uuid.UUID | str) -> bool:
        client = self._get_client()
        if client is None:
            return False

        key = self._key(account_id)
        try:
            return bool(client.exists(key))
        except Exception:
            return False

    @contextmanager
    def lock(
        self, account_id: uuid.UUID | str, ttl_seconds: int = 300
    ) -> Generator[str, None, None]:
        acquired = self.acquire(account_id, ttl_seconds=ttl_seconds)
        if not acquired:
            raise SocialSyncLockConflictError(
                f"Concurrent sync lock conflict for social account: {account_id}"
            )
        try:
            yield str(account_id)
        finally:
            self.release(account_id)


_default_lock_instance: SocialSyncLock | None = None


def get_social_sync_lock() -> SocialSyncLock:
    """Factory retrieving default sync lock (Redis if available, else in-memory)."""
    global _default_lock_instance
    if _default_lock_instance is None:
        try:
            from app.core.redis import get_redis_client
            client = get_redis_client()
            if client:
                _default_lock_instance = RedisSocialSyncLock(client)
            else:
                _default_lock_instance = InMemorySocialSyncLock()
        except Exception:
            _default_lock_instance = InMemorySocialSyncLock()
    return _default_lock_instance


__all__ = [
    "SocialSyncLock",
    "InMemorySocialSyncLock",
    "RedisSocialSyncLock",
    "get_social_sync_lock",
]
