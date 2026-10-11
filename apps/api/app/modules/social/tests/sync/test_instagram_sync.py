from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.events.models import OutboxEvent
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    ProviderAccessStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.eligibility.service import AccountNotAcceptedError
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.instagram.adapter import InstagramAdapter
from app.modules.social.providers.instagram.client import InstagramClient
from app.modules.social.providers.instagram.credentials import (
    InMemoryInstagramCredentialService,
)
from app.modules.social.sync.instagram_sync import InstagramSyncService


def create_eligible_instagram_creator_and_account(
    session: Session,
    *,
    handle: str = "bastar_explorer",
    provider_account_id: str = "1784_bastar_explorer",
) -> tuple[Creator, SocialAccount]:
    creator = Creator(
        handle=handle,
        display_name="Bastar Explorer",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle=f"@{handle}",
        profile_url=f"https://www.instagram.com/{handle}/",
        external_account_id=provider_account_id,
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        metadata_json={
            "instagram": {
                "provider_account_id": provider_account_id,
                "provider_access_status": ProviderAccessStatus.AVAILABLE.value,
            }
        },
    )
    session.add(account)
    session.commit()
    return creator, account


@pytest.mark.asyncio
async def test_sync_eligible_instagram_account_e2e_success(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "mock_meta_access_token_123"})

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["authorization"] == "Bearer mock_meta_access_token_123"
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18012345678",
                        "caption": "Chitrakote Falls during heavy monsoon in Bastar #waterfalls #bastar",
                        "media_type": "VIDEO",
                        "media_product_type": "REELS",
                        "permalink": "https://www.instagram.com/reel/Cx12345/",
                        "thumbnail_url": "https://img.instagram.com/thumb1.jpg",
                        "timestamp": "2026-10-05T12:00:00+0000",
                        "username": "bastar_explorer",
                    },
                    {
                        "id": "18087654321",
                        "caption": "Dhokra Bell Metal craft casting Kondagaon",
                        "media_type": "CAROUSEL_ALBUM",
                        "media_product_type": "FEED",
                        "permalink": "https://www.instagram.com/p/Cx67890/",
                        "thumbnail_url": "https://img.instagram.com/thumb2.jpg",
                        "timestamp": "2026-10-04T10:00:00+0000",
                        "username": "bastar_explorer",
                        "children": {
                            "data": [
                                {"id": "18087654321_1", "media_type": "IMAGE"},
                                {"id": "18087654321_2", "media_type": "IMAGE"},
                            ]
                        },
                    },
                ],
                "paging": {
                    "cursors": {"after": "page_1_after_cursor"},
                },
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(
        session,
        client=client,
        provider=adapter,
        credential_service=credentials,
    )

    result = await sync_service.sync_account(account.id)

    assert result.status == SyncStatus.SUCCEEDED.value
    assert result.discovered == 2
    assert result.created == 2
    assert result.updated == 0
    assert result.failed == 0

    # Verify content saved in database
    contents = session.scalars(
        select(SocialContent).where(SocialContent.social_account_id == account.id)
    ).all()
    assert len(contents) == 2

    reel_content = next(c for c in contents if c.provider_content_id == "18012345678")
    assert reel_content.content_type == ContentType.REEL.value
    assert reel_content.aspect_ratio == "9:16"
    assert reel_content.district_id == "bastar"
    assert reel_content.source_url == "https://www.instagram.com/reel/Cx12345/"

    carousel_content = next(c for c in contents if c.provider_content_id == "18087654321")
    assert carousel_content.content_type == ContentType.POST.value
    assert carousel_content.aspect_ratio == "1:1"
    assert carousel_content.metadata_json["instagram"]["media_count"] == 2

    # Verify sync state in database
    sync_state = session.scalar(
        select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id)
    )
    assert sync_state is not None
    assert sync_state.sync_status == SyncStatus.SUCCEEDED.value
    assert sync_state.items_synced_total == 2
    assert sync_state.cursor is not None
    cursor_data = json.loads(sync_state.cursor)
    assert cursor_data["last_seen_media_id"] == "18012345678"

    # Verify Outbox event
    outbox = session.scalars(
        select(OutboxEvent).where(OutboxEvent.aggregate_id == account.id)
    ).all()
    assert len(outbox) >= 1
    synced_event = next(e for e in outbox if e.event_type == "SOCIAL_CONTENT_SYNCED")
    assert synced_event.payload["created"] == 2


@pytest.mark.asyncio
async def test_sync_deduplication_and_idempotency(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "mock_token"})

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18099999999",
                        "caption": "Bastar Dussehra celebration #jagdalpur",
                        "media_type": "IMAGE",
                        "media_product_type": "FEED",
                        "permalink": "https://www.instagram.com/p/Cx99999/",
                        "timestamp": "2026-10-05T12:00:00+0000",
                        "username": "bastar_explorer",
                    }
                ],
                "paging": {},
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    # Sync 1: Initial creation
    res1 = await sync_service.sync_account(account.id)
    assert res1.created == 1
    assert res1.updated == 0

    count1 = session.scalars(select(SocialContent).where(SocialContent.social_account_id == account.id)).all()
    assert len(count1) == 1

    # Sync 2: Re-run with force=True -> must update, not duplicate
    res2 = await sync_service.sync_account(account.id, force=True)
    assert res2.created == 0
    assert res2.updated == 1

    all_contents = session.scalars(select(SocialContent).where(SocialContent.social_account_id == account.id)).all()
    assert len(all_contents) == 1


@pytest.mark.asyncio
async def test_sync_editorial_preservation(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "mock_token"})

    # Pre-existing content with editorial curation
    curated_content = SocialContent(
        creator_id=creator.id,
        social_account_id=account.id,
        provider="instagram",
        provider_content_id="18055555555",
        slug="ig-18055555555",
        title="Original Raw Title",
        district_id="dantewada",
        place_slug="dholkal-ganesha",
        cultural_tags=["heritage", "ancient-sculpture"],
        tourism_tags=["trekking", "hills"],
    )
    session.add(curated_content)
    session.commit()

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18055555555",
                        "caption": "Updated caption from Instagram for Dholkal Ganesha",
                        "media_type": "IMAGE",
                        "media_product_type": "FEED",
                        "permalink": "https://www.instagram.com/p/Cx55555/",
                        "timestamp": "2026-10-05T12:00:00+0000",
                        "username": "bastar_explorer",
                    }
                ],
                "paging": {},
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    res = await sync_service.sync_account(account.id, force=True)
    assert res.updated == 1

    updated_content = session.scalar(
        select(SocialContent).where(SocialContent.provider_content_id == "18055555555")
    )
    assert updated_content is not None
    # Editorial curation fields MUST remain preserved
    assert updated_content.district_id == "dantewada"
    assert updated_content.place_slug == "dholkal-ganesha"
    assert updated_content.cultural_tags == ["heritage", "ancient-sculpture"]
    assert updated_content.tourism_tags == ["trekking", "hills"]
    # Provider-owned fields are refreshed
    assert "Updated caption from Instagram" in updated_content.title


@pytest.mark.asyncio
async def test_sync_checkpoint_incremental(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "mock_token"})

    # Pre-populate sync state with a checkpoint
    sync_state = SocialAccountSyncState(
        social_account_id=account.id,
        sync_status=SyncStatus.SUCCEEDED.value,
        cursor=json.dumps({
            "last_seen_published_at": "2026-10-04T00:00:00+00:00",
            "last_seen_media_id": "18000000000",
        }),
    )
    session.add(sync_state)
    session.commit()

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18000000002",
                        "caption": "Newest post",
                        "media_type": "IMAGE",
                        "permalink": "https://www.instagram.com/p/new/",
                        "timestamp": "2026-10-05T12:00:00+00:00",
                    },
                    {
                        "id": "18000000001",
                        "caption": "Older post prior to checkpoint",
                        "media_type": "IMAGE",
                        "permalink": "https://www.instagram.com/p/old/",
                        "timestamp": "2026-10-03T12:00:00+00:00",
                    },
                ],
                "paging": {},
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    result = await sync_service.sync_account(account.id)
    # Only the item newer than checkpoint (18000000002) should be processed
    assert result.created == 1
    assert result.discovered == 1

    contents = session.scalars(select(SocialContent).where(SocialContent.social_account_id == account.id)).all()
    assert len(contents) == 1
    assert contents[0].provider_content_id == "18000000002"


@pytest.mark.asyncio
async def test_sync_ineligible_account_raises(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    account.status = SocialAccountStatus.PENDING.value
    session.commit()

    sync_service = InstagramSyncService(session)

    with pytest.raises(AccountNotAcceptedError, match="not eligible for synchronization"):
        await sync_service.sync_account(account.id)


@pytest.mark.asyncio
async def test_sync_blocked_on_expired_access_status(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    account.metadata_json = {
        "instagram": {
            "provider_access_status": ProviderAccessStatus.EXPIRED.value,
        }
    }
    session.commit()

    sync_service = InstagramSyncService(session)
    result = await sync_service.sync_account(account.id)

    assert result.status == SyncStatus.FAILED.value
    assert "Provider access status is 'expired'" in result.error


@pytest.mark.asyncio
async def test_sync_auth_failure_updates_provider_access_status(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "expired_token"})

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            400,
            json={
                "error": {
                    "message": "Error validating access token: Session has expired.",
                    "code": 190,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    result = await sync_service.sync_account(account.id)
    assert result.status == SyncStatus.FAILED.value

    # Verify provider access status degraded to EXPIRED without corrupting or deleting account
    updated_account = session.scalar(select(SocialAccount).where(SocialAccount.id == account.id))
    assert updated_account is not None
    assert updated_account.metadata_json["instagram"]["provider_access_status"] == ProviderAccessStatus.EXPIRED.value


@pytest.mark.asyncio
async def test_sync_permission_revoked_updates_provider_access_status(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "revoked_token"})

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={
                "error": {
                    "message": "(#200) Permissions revoked by user",
                    "code": 200,
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    result = await sync_service.sync_account(account.id)
    assert result.status == SyncStatus.FAILED.value

    updated_account = session.scalar(select(SocialAccount).where(SocialAccount.id == account.id))
    assert updated_account is not None
    assert updated_account.metadata_json["instagram"]["provider_access_status"] == ProviderAccessStatus.REVOKED.value


@pytest.mark.asyncio
async def test_sync_retry_on_transient_error(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    credentials = InMemoryInstagramCredentialService({account.id: "mock_token"})

    call_count = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise httpx.ReadTimeout("Temporary read timeout")
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18011112222",
                        "caption": "Bastar Palace",
                        "media_type": "IMAGE",
                        "permalink": "https://www.instagram.com/p/palace/",
                    }
                ],
                "paging": {},
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    result = await sync_service.sync_account(account.id)
    assert result.status == SyncStatus.SUCCEEDED.value
    assert result.created == 1
    assert call_count == 2


@pytest.mark.asyncio
async def test_security_no_tokens_leaked(session: Session):
    creator, account = create_eligible_instagram_creator_and_account(session)
    secret_token = "SECRET_META_TOKEN_NEVER_LEAK_12345"
    credentials = InMemoryInstagramCredentialService({account.id: secret_token})

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "id": "18099887766",
                        "caption": "Secret token test caption",
                        "media_type": "IMAGE",
                        "permalink": "https://www.instagram.com/p/secret/",
                    }
                ],
                "paging": {},
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = InstagramClient(credential_service=credentials, http_client=mock_client)
    adapter = InstagramAdapter(client=client, credential_service=credentials)
    sync_service = InstagramSyncService(session, client=client, provider=adapter, credential_service=credentials)

    await sync_service.sync_account(account.id)

    # 1. Check account metadata
    account_db = session.scalar(select(SocialAccount).where(SocialAccount.id == account.id))
    assert secret_token not in json.dumps(account_db.metadata_json)

    # 2. Check sync state cursor
    sync_state = session.scalar(select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id))
    assert secret_token not in (sync_state.cursor or "")

    # 3. Check content metadata
    content = session.scalar(select(SocialContent).where(SocialContent.provider_content_id == "18099887766"))
    assert secret_token not in json.dumps(content.metadata_json)

    # 4. Check outbox events
    outbox_events = session.scalars(select(OutboxEvent).where(OutboxEvent.aggregate_id == account.id)).all()
    for evt in outbox_events:
        assert secret_token not in json.dumps(evt.payload)
