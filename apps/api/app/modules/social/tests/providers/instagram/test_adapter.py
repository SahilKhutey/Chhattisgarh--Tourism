from __future__ import annotations

import uuid
import httpx
import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.instagram.adapter import InstagramAdapter
from app.modules.social.providers.instagram.client import InstagramClient
from app.modules.social.providers.instagram.credentials import (
    InMemoryInstagramCredentialService,
)


def test_instagram_adapter_capabilities():
    adapter = InstagramAdapter()
    caps = adapter.capabilities()
    assert adapter.platform == SocialPlatform.INSTAGRAM
    assert caps.supports_posts is True
    assert caps.supports_reels is True
    assert caps.supports_shorts is False
    assert caps.supports_videos is True
    assert caps.supports_embeds is True


def test_get_account_capabilities():
    adapter = InstagramAdapter()
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform="instagram",
        handle="@bastar_travels",
        metadata_json={
            "instagram": {
                "capabilities": {
                    "media_read": True,
                    "reels_read": True,
                    "insights_read": True,
                    "webhooks_read": True,
                }
            }
        },
    )
    acc_caps = adapter.get_account_capabilities(account)
    assert acc_caps.can_read_media is True
    assert acc_caps.can_read_reels is True
    assert acc_caps.can_read_insights is True
    assert acc_caps.can_receive_webhooks is True


@pytest.mark.asyncio
async def test_adapter_offline_mode():
    adapter = InstagramAdapter(client=None)
    account_id = uuid.uuid4()
    info = await adapter.get_account_info(account_id, "@bastar_travels")
    assert info.username == "bastar_travels"
    assert info.followers_count == 12000

    profile = await adapter.verify_account_async("@bastar_travels", account_id=account_id)
    assert profile.is_valid is True
    assert profile.handle == "@bastar_travels"

    account = SocialAccount(
        id=account_id,
        creator_id=uuid.uuid4(),
        platform="instagram",
        handle="@bastar_travels",
    )
    page = await adapter.fetch_media_page(account)
    assert page.items == []
    assert page.has_next is False


@pytest.mark.asyncio
async def test_adapter_online_get_account_info_and_verify():
    account_id = uuid.uuid4()
    credentials = InMemoryInstagramCredentialService({account_id: "valid_token_123"})

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v21.0/1784_bastar_travels"
        return httpx.Response(
            200,
            json={
                "id": "1784_bastar_travels",
                "username": "bastar_travels",
                "name": "Bastar Travels",
                "biography": "Official Bastar guide",
                "profile_picture_url": "https://example.com/pic.jpg",
                "followers_count": 25000,
                "media_count": 80,
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)

    info = await adapter.get_account_info(account_id, "bastar_travels")
    assert info.provider_account_id == "1784_bastar_travels"
    assert info.username == "bastar_travels"
    assert info.followers_count == 25000

    profile = await adapter.verify_account_async("bastar_travels", account_id=account_id)
    assert profile.is_valid is True
    assert profile.handle == "@bastar_travels"
    assert profile.follower_or_subscriber_count == 25000


@pytest.mark.asyncio
async def test_adapter_verify_account_unauthorized():
    account_id = uuid.uuid4()
    credentials = InMemoryInstagramCredentialService({account_id: "expired_token"})

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            400,
            json={
                "error": {
                    "message": "Session expired",
                    "code": 190,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)

    profile = await adapter.verify_account_async("bastar_travels", account_id=account_id)
    assert profile.is_valid is False
    assert profile.metadata["error"] == "unauthorized"


def test_adapter_verify_account_sync_wrapper():
    adapter = InstagramAdapter(client=None)
    profile = adapter.verify_account("@bastar_travels")
    assert profile.is_valid is True
    assert profile.handle == "@bastar_travels"


@pytest.mark.asyncio
async def test_adapter_fetch_media_page_online():
    account_id = uuid.uuid4()
    credentials = InMemoryInstagramCredentialService({account_id: "valid_token_123"})

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v21.0/1784_bastar_travels/media"
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18055555555",
                        "caption": "Tirathgarh Falls in full flow",
                        "media_type": "VIDEO",
                        "media_product_type": "REELS",
                        "permalink": "https://www.instagram.com/reel/Cx11111/",
                        "timestamp": "2026-10-05T10:00:00+0000",
                        "username": "bastar_travels",
                    }
                ],
                "paging": {
                    "cursors": {"after": "page_2_cursor"},
                    "next": "https://graph.facebook.com/next_page",
                },
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)

    account = SocialAccount(
        id=account_id,
        creator_id=uuid.uuid4(),
        platform="instagram",
        handle="@bastar_travels",
        external_account_id="1784_bastar_travels",
    )

    page = await adapter.fetch_media_page(account)
    assert len(page.items) == 1
    assert page.items[0].provider_id == "18055555555"
    assert page.items[0].media_product_type == "REELS"
    assert page.has_next is True
    assert page.next_cursor == "page_2_cursor"
