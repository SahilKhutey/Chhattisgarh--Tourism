from __future__ import annotations

from unittest.mock import MagicMock, patch
from app.modules.public_content.cache import PublicContentCache


def test_cache_key_generation():
    cache = PublicContentCache()
    assert cache.key("barna", "en") == "cg:public-content:en:barna"
    assert cache.key("barna", "hi") == "cg:public-content:hi:barna"


def test_cache_encode_decode():
    cache = PublicContentCache()
    data = {"slug": "barna", "name": "Barnawapara"}
    encoded = cache.encode(data)
    assert isinstance(encoded, str)
    decoded = cache.decode(encoded)
    assert decoded == data


def test_cache_get_and_set_with_mock():
    cache = PublicContentCache()
    mock_redis = MagicMock()
    mock_redis.get.return_value = '{"slug": "test", "name": "Test"}'

    with patch("app.modules.public_content.cache.redis_client", mock_redis):
        val = cache.get("test", "en")
        assert val == {"slug": "test", "name": "Test"}
        mock_redis.get.assert_called_once_with("cg:public-content:en:test")

        cache.set("test", "en", {"slug": "test", "name": "Test"})
        mock_redis.setex.assert_called_once()

        cache.invalidate("test")
        mock_redis.delete.assert_called_once()
