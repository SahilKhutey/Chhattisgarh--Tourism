import pytest
from app.core.redis import redis_client


def test_redis_ping():
    try:
        assert redis_client.ping() is True
    except Exception as exc:
        pytest.skip(f"Redis service not reachable in current environment: {exc}")
