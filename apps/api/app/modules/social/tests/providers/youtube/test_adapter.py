from __future__ import annotations

import httpx
import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.providers.youtube.adapter import YouTubeAdapter
from app.modules.social.providers.youtube.client import YouTubeClient
from app.modules.social.providers.youtube.errors import YouTubeAccountNotFoundError


def test_youtube_adapter_capabilities():
    adapter = YouTubeAdapter()
    caps = adapter.capabilities()
    assert adapter.platform == SocialPlatform.YOUTUBE
    assert caps.supports_shorts is True
    assert caps.supports_videos is True
    assert caps.supports_posts is False
    assert caps.supports_reels is False
    assert caps.supports_embeds is True


@pytest.mark.asyncio
async def test_youtube_adapter_get_channel_success():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "items": [
                    {
                        "id": "UC_CG12345",
                        "snippet": {
                            "title": "Unseen Bastar",
                            "description": "Travel Bastar",
                            "customUrl": "@unseen_bastar",
                            "thumbnails": {"high": {"url": "https://img.youtube.com/high.jpg"}},
                        },
                        "contentDetails": {
                            "relatedPlaylists": {"uploads": "UU_CG12345"},
                        },
                        "statistics": {
                            "subscriberCount": "15000",
                            "videoCount": "42",
                        },
                    }
                ]
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)
    adapter = YouTubeAdapter(client=client)

    channel = await adapter.get_channel("@unseen_bastar")
    assert channel.channel_id == "UC_CG12345"
    assert channel.handle == "@unseen_bastar"
    assert channel.title == "Unseen Bastar"
    assert channel.uploads_playlist_id == "UU_CG12345"
    assert channel.subscriber_count == 15000
    assert channel.video_count == 42


@pytest.mark.asyncio
async def test_youtube_adapter_get_channel_not_found():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"items": []})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)
    adapter = YouTubeAdapter(client=client)

    with pytest.raises(YouTubeAccountNotFoundError):
        await adapter.get_channel("@nonexistent")


@pytest.mark.asyncio
async def test_youtube_adapter_verify_account_async_valid():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "items": [
                    {
                        "id": "UC_VALID_123",
                        "snippet": {
                            "title": "Bastar Travel Channel",
                            "description": "Guides to Bastar",
                            "customUrl": "@bastar_travel",
                            "thumbnails": {"default": {"url": "https://img.youtube.com/thumb.jpg"}},
                        },
                        "contentDetails": {
                            "relatedPlaylists": {"uploads": "UU_VALID_123"},
                        },
                        "statistics": {"subscriberCount": "500"},
                    }
                ]
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)
    adapter = YouTubeAdapter(client=client)

    profile = await adapter.verify_account_async("@bastar_travel")
    assert profile.is_valid is True
    assert profile.handle == "@bastar_travel"
    assert profile.display_name == "Bastar Travel Channel"
    assert profile.provider_channel_id == "UC_VALID_123"
    assert profile.metadata["uploads_playlist_id"] == "UU_VALID_123"
    assert profile.metadata["channel_id"] == "UC_VALID_123"


@pytest.mark.asyncio
async def test_youtube_adapter_verify_account_async_not_found():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"items": []})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="test-key", http_client=mock_client)
    adapter = YouTubeAdapter(client=client)

    profile = await adapter.verify_account_async("@unknown")
    assert profile.is_valid is False
    assert profile.metadata["error"] == "channel_not_found"


def test_youtube_adapter_offline_mode_without_client():
    adapter = YouTubeAdapter(client=None)
    profile = adapter.verify_account("@offline_creator")
    assert profile.is_valid is True
    assert "offline_creator" in profile.handle
    assert profile.metadata["uploads_playlist_id"].startswith("UU_")
