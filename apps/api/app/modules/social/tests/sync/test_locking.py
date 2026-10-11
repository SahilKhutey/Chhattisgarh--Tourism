import uuid
from unittest.mock import MagicMock
import pytest

from app.modules.social.domain.errors import SocialSyncLockConflictError
from app.modules.social.sync.locking import (
    InMemorySocialSyncLock,
    RedisSocialSyncLock,
)


def test_in_memory_lock_acquire_and_release():
    lock = InMemorySocialSyncLock()
    account_id = uuid.uuid4()

    assert lock.is_locked(account_id) is False

    # First acquire succeeds
    assert lock.acquire(account_id, ttl_seconds=60) is True
    assert lock.is_locked(account_id) is True

    # Concurrent acquire fails
    assert lock.acquire(account_id, ttl_seconds=60) is False

    # Release allows re-acquire
    lock.release(account_id)
    assert lock.is_locked(account_id) is False
    assert lock.acquire(account_id, ttl_seconds=60) is True


def test_in_memory_lock_context_manager():
    lock = InMemorySocialSyncLock()
    account_id = uuid.uuid4()

    with lock.lock(account_id):
        assert lock.is_locked(account_id) is True
        # Concurrent lock attempt raises SocialSyncLockConflictError
        with pytest.raises(SocialSyncLockConflictError):
            with lock.lock(account_id):
                pass

    # Lock is released after context manager exits
    assert lock.is_locked(account_id) is False


def test_redis_lock_acquire_and_release():
    mock_redis = MagicMock()
    mock_redis.set.return_value = True

    lock = RedisSocialSyncLock(redis_client=mock_redis)
    account_id = uuid.uuid4()

    assert lock.acquire(account_id, ttl_seconds=120) is True
    mock_redis.set.assert_called_once()
    key, token = mock_redis.set.call_args[0][0], mock_redis.set.call_args[0][1]
    assert f"social:sync:{account_id}" == key

    # Release invokes Lua script
    lock.release(account_id)
    mock_redis.eval.assert_called_once()
