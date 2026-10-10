from __future__ import annotations

import logging
import httpx
import pytest

from app.modules.social.providers.youtube.client import YouTubeClient
from app.modules.social.providers.youtube.errors import (
    TransientProviderError,
    YouTubeAccountNotFoundError,
    YouTubeAPIError,
    YouTubeAuthenticationError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeUnavailableError,
)


@pytest.mark.asyncio
async def test_youtube_client_get_channel_by_handle_success():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/youtube/v3/channels"
        assert request.url.params["forHandle"] == "cg_tourism"
        assert request.url.params["key"] == "test-api-key"
        return httpx.Response(
            200,
            json={
                "items": [
                    {
                        "id": "UC1234567890",
                        "snippet": {"title": "Chhattisgarh Tourism", "customUrl": "@cg_tourism"},
                        "contentDetails": {"relatedPlaylists": {"uploads": "UU1234567890"}},
                    }
                ]
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-api-key", http_client=mock_client)
    res = await client.get_channel_by_handle("@cg_tourism")

    assert len(res["items"]) == 1
    assert res["items"][0]["id"] == "UC1234567890"


@pytest.mark.asyncio
async def test_youtube_client_get_channel_by_id_success():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/youtube/v3/channels"
        assert request.url.params["id"] == "UC1234567890"
        return httpx.Response(
            200,
            json={"items": [{"id": "UC1234567890", "snippet": {"title": "CG Tourism"}}]},
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-api-key", http_client=mock_client)
    res = await client.get_channel_by_id("UC1234567890")

    assert len(res["items"]) == 1
    assert res["items"][0]["snippet"]["title"] == "CG Tourism"


@pytest.mark.asyncio
async def test_youtube_client_get_playlist_items_success():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/youtube/v3/playlistItems"
        assert request.url.params["playlistId"] == "UU1234567890"
        assert request.url.params["maxResults"] == "50"
        return httpx.Response(
            200,
            json={
                "nextPageToken": "NEXT_PAGE_123",
                "items": [
                    {
                        "contentDetails": {"videoId": "vid_abc123"},
                        "snippet": {"publishedAt": "2026-10-01T12:00:00Z"},
                    }
                ],
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-api-key", http_client=mock_client)
    res = await client.get_playlist_items("UU1234567890", max_results=50)

    assert res["nextPageToken"] == "NEXT_PAGE_123"
    assert len(res["items"]) == 1
    assert res["items"][0]["contentDetails"]["videoId"] == "vid_abc123"


@pytest.mark.asyncio
async def test_youtube_client_get_videos_batch_success():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/youtube/v3/videos"
        assert request.url.params["id"] == "vid_1,vid_2"
        return httpx.Response(
            200,
            json={
                "items": [
                    {"id": "vid_1", "snippet": {"title": "Video 1"}},
                    {"id": "vid_2", "snippet": {"title": "Video 2"}},
                ]
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-api-key", http_client=mock_client)
    res = await client.get_videos(["vid_1", "vid_2"])

    assert len(res["items"]) == 2
    assert res["items"][0]["id"] == "vid_1"
    assert res["items"][1]["id"] == "vid_2"


@pytest.mark.asyncio
async def test_youtube_client_get_videos_empty_list():
    client = YouTubeClient(api_key="test-api-key")
    res = await client.get_videos([])
    assert res == {"items": []}


@pytest.mark.asyncio
async def test_youtube_client_quota_exceeded_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={
                "error": {
                    "code": 403,
                    "message": "The request cannot be completed because you have exceeded your quota.",
                    "errors": [{"message": "Quota Exceeded", "domain": "youtube.quota", "reason": "quotaExceeded"}],
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-api-key", http_client=mock_client)

    with pytest.raises(YouTubeQuotaExceededError) as exc_info:
        await client.get_channel_by_handle("any_handle")

    assert exc_info.value.status_code == 403
    assert exc_info.value.reason == "quotaExceeded"


@pytest.mark.asyncio
async def test_youtube_client_rate_limit_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            429,
            json={
                "error": {
                    "code": 429,
                    "message": "Too Many Requests",
                    "errors": [{"reason": "rateLimitExceeded"}],
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-api-key", http_client=mock_client)

    with pytest.raises(YouTubeRateLimitError) as exc_info:
        await client.get_playlist_items("UU_any")

    assert exc_info.value.status_code == 429


@pytest.mark.asyncio
async def test_youtube_client_invalid_api_key_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={
                "error": {
                    "code": 403,
                    "message": "API key not valid. Please pass a valid API key.",
                    "errors": [{"reason": "keyInvalid"}],
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="invalid-key", http_client=mock_client)

    with pytest.raises(YouTubeAuthenticationError) as exc_info:
        await client.get_channel_by_id("UC_any")

    assert exc_info.value.status_code == 403
    assert exc_info.value.reason == "keyInvalid"


@pytest.mark.asyncio
async def test_youtube_client_404_not_found_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            404,
            json={
                "error": {
                    "code": 404,
                    "message": "Resource not found",
                    "errors": [{"reason": "notFound"}],
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)

    with pytest.raises(YouTubeAccountNotFoundError) as exc_info:
        await client.get_channel_by_id("UC_missing")

    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_youtube_client_503_unavailable_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            503,
            json={"error": {"code": 503, "message": "Backend Error", "errors": [{"reason": "backendError"}]}},
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)

    with pytest.raises(YouTubeUnavailableError) as exc_info:
        await client.get_channel_by_id("UC_test")

    assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_youtube_client_timeout_raises_transient_error():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("Read timed out")

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)

    with pytest.raises(TransientProviderError) as exc_info:
        await client.get_channel_by_id("UC_test")

    assert "timed out" in str(exc_info.value)


@pytest.mark.asyncio
async def test_youtube_client_api_key_not_logged(caplog):
    secret_key = "AIzaSySuperSecretKey12345"

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"items": []})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key=secret_key, http_client=mock_client)

    with caplog.at_level(logging.DEBUG, logger="app.modules.social.providers.youtube.client"):
        await client.get_channel_by_handle("@cg_tourism")

    assert len(caplog.records) > 0
    for record in caplog.records:
        assert secret_key not in record.message
        assert secret_key not in str(record.args)
