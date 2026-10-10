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
    CreatorStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.eligibility.service import AccountNotAcceptedError
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.youtube.adapter import YouTubeAdapter
from app.modules.social.providers.youtube.client import YouTubeClient
from app.modules.social.providers.youtube.mapper import YouTubeContentMapper
from app.modules.social.sync.youtube_sync import YouTubeSyncService


def create_eligible_creator_and_account(
    session: Session,
    *,
    handle: str = "bastar_explorer",
    channel_id: str = "UC_BASTAR_CHANNEL",
    uploads_playlist_id: str = "UU_BASTAR_UPLOADS",
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
        platform=SocialPlatform.YOUTUBE.value,
        handle=f"@{handle}",
        profile_url=f"https://www.youtube.com/@{handle}",
        external_account_id=channel_id,
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        metadata_json={
            "youtube": {
                "channel_id": channel_id,
                "uploads_playlist_id": uploads_playlist_id,
            }
        },
    )
    session.add(account)
    session.commit()
    return creator, account


@pytest.mark.asyncio
async def test_sync_eligible_account_e2e_success(session: Session):
    creator, account = create_eligible_creator_and_account(session)

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "/youtube/v3/playlistItems" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "contentDetails": {"videoId": "vid_bastar_1"},
                            "snippet": {"publishedAt": "2026-10-05T12:00:00Z"},
                        },
                        {
                            "contentDetails": {"videoId": "vid_bastar_2"},
                            "snippet": {"publishedAt": "2026-10-04T10:00:00Z"},
                        },
                    ]
                },
            )
        if "/youtube/v3/videos" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "vid_bastar_1",
                            "snippet": {
                                "title": "Chitrakote Waterfalls in Monsoon Bastar",
                                "description": "Witnessing the widest waterfall of India.",
                                "publishedAt": "2026-10-05T12:00:00Z",
                                "thumbnails": {"high": {"url": "https://img.youtube.com/thumb1.jpg"}},
                            },
                            "contentDetails": {"duration": "PT3M30S"},
                            "status": {"privacyStatus": "public"},
                            "statistics": {"viewCount": "12000", "likeCount": "900"},
                        },
                        {
                            "id": "vid_bastar_2",
                            "snippet": {
                                "title": "Bastar Dhokra Bell Metal Craft Kondagaon",
                                "description": "Ancient lost-wax casting technique #shorts",
                                "publishedAt": "2026-10-04T10:00:00Z",
                                "thumbnails": {"high": {"url": "https://img.youtube.com/thumb2.jpg"}},
                            },
                            "contentDetails": {"duration": "PT55S"},
                            "status": {"privacyStatus": "public"},
                            "statistics": {"viewCount": "5000", "likeCount": "400"},
                        },
                    ]
                },
            )
        return httpx.Response(404, json={})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="mock-api-key", http_client=mock_client)
    adapter = YouTubeAdapter(client=client)

    sync_service = YouTubeSyncService(
        session,
        client=client,
        provider=adapter,
    )

    result = await sync_service.sync_account(account.id)

    assert result.status == SyncStatus.SUCCEEDED.value
    assert result.discovered == 2
    assert result.created == 2
    assert result.updated == 0
    assert result.failed == 0

    # Verify content in database
    contents = session.scalars(
        select(SocialContent).where(SocialContent.social_account_id == account.id)
    ).all()
    assert len(contents) == 2

    # Verify sync state in database
    sync_state = session.scalar(
        select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id)
    )
    assert sync_state is not None
    assert sync_state.sync_status == SyncStatus.SUCCEEDED.value
    assert sync_state.items_synced_total == 2
    assert sync_state.cursor is not None
    cursor_data = json.loads(sync_state.cursor)
    assert cursor_data["last_seen_video_id"] == "vid_bastar_1"

    # Verify Outbox event
    outbox = session.scalars(
        select(OutboxEvent).where(OutboxEvent.aggregate_id == account.id)
    ).all()
    assert len(outbox) == 1
    assert outbox[0].event_type == "SOCIAL_CONTENT_SYNCED"


@pytest.mark.asyncio
async def test_sync_deduplication_and_idempotency(session: Session):
    creator, account = create_eligible_creator_and_account(session)

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "/youtube/v3/playlistItems" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "contentDetails": {"videoId": "vid_dup_1"},
                            "snippet": {"publishedAt": "2026-10-05T12:00:00Z"},
                        }
                    ]
                },
            )
        if "/youtube/v3/videos" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "vid_dup_1",
                            "snippet": {
                                "title": "Bastar Dussehra Festival",
                                "description": "75 days festival in Jagdalpur",
                                "publishedAt": "2026-10-05T12:00:00Z",
                            },
                            "contentDetails": {"duration": "PT4M00S"},
                            "status": {"privacyStatus": "public"},
                            "statistics": {"viewCount": "1000"},
                        }
                    ]
                },
            )
        return httpx.Response(404, json={})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="mock-api-key", http_client=mock_client)
    sync_service = YouTubeSyncService(session, client=client, provider=YouTubeAdapter(client=client))

    # Sync 1: First insertion
    res1 = await sync_service.sync_account(account.id)
    assert res1.created == 1
    assert res1.updated == 0

    count1 = session.scalar(select(SocialContent).where(SocialContent.social_account_id == account.id))
    assert count1 is not None

    # Sync 2: Run again with same content (force=True) -> must update, not duplicate
    res2 = await sync_service.sync_account(account.id, force=True)
    assert res2.created == 0
    assert res2.updated == 1

    all_contents = session.scalars(
        select(SocialContent).where(SocialContent.social_account_id == account.id)
    ).all()
    assert len(all_contents) == 1


@pytest.mark.asyncio
async def test_sync_editorial_preservation(session: Session):
    creator, account = create_eligible_creator_and_account(session)

    # Pre-existing content record with editorial curation
    curated_content = SocialContent(
        creator_id=creator.id,
        social_account_id=account.id,
        provider="youtube",
        provider_content_id="vid_preserve_1",
        slug="yt-vid_preserve_1",
        title="Original Raw Title",
        district_id="dantewada",
        place_slug="dholkal-ganesha",
        cultural_tags=["heritage", "ancient-sculpture"],
        tourism_tags=["trekking", "hills"],
        views_count=500,
    )
    session.add(curated_content)
    session.commit()

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "/youtube/v3/playlistItems" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "contentDetails": {"videoId": "vid_preserve_1"},
                            "snippet": {"publishedAt": "2026-10-05T12:00:00Z"},
                        }
                    ]
                },
            )
        if "/youtube/v3/videos" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "vid_preserve_1",
                            "snippet": {
                                "title": "Refreshed 4K Title From YouTube",
                                "description": "Updated description",
                                "publishedAt": "2026-10-05T12:00:00Z",
                            },
                            "contentDetails": {"duration": "PT5M00S"},
                            "status": {"privacyStatus": "public"},
                            "statistics": {"viewCount": "99999", "likeCount": "5555"},
                        }
                    ]
                },
            )
        return httpx.Response(404, json={})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="mock-api-key", http_client=mock_client)
    sync_service = YouTubeSyncService(session, client=client, provider=YouTubeAdapter(client=client))

    res = await sync_service.sync_account(account.id)
    assert res.updated == 1

    session.expire_all()
    updated_row = session.scalar(
        select(SocialContent).where(SocialContent.provider_content_id == "vid_preserve_1")
    )
    assert updated_row is not None
    # Provider fields refreshed:
    assert updated_row.title == "Refreshed 4K Title From YouTube"
    assert updated_row.views_count == 99999
    assert updated_row.likes_count == 5555
    # Editorial fields strictly preserved:
    assert updated_row.place_slug == "dholkal-ganesha"
    assert updated_row.district_id == "dantewada"
    assert "heritage" in updated_row.cultural_tags
    assert "trekking" in updated_row.tourism_tags


@pytest.mark.asyncio
async def test_sync_incremental_checkpoint_stops_pagination(session: Session):
    creator, account = create_eligible_creator_and_account(session)

    # Set up previous sync checkpoint at 2026-10-05
    checkpoint_dt = datetime(2026, 10, 5, 0, 0, 0, tzinfo=timezone.utc)
    sync_state = SocialAccountSyncState(
        social_account_id=account.id,
        cursor=json.dumps({"last_seen_published_at": checkpoint_dt.isoformat(), "last_seen_video_id": "vid_prev"}),
        sync_status=SyncStatus.SUCCEEDED.value,
    )
    session.add(sync_state)
    session.commit()

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "/youtube/v3/playlistItems" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        # Item 1: Newer than checkpoint (should be processed)
                        {
                            "contentDetails": {"videoId": "vid_brand_new"},
                            "snippet": {"publishedAt": "2026-10-07T12:00:00Z"},
                        },
                        # Item 2: Older than checkpoint (should trigger stop)
                        {
                            "contentDetails": {"videoId": "vid_old_already_seen"},
                            "snippet": {"publishedAt": "2026-10-04T12:00:00Z"},
                        },
                        # Item 3: Should not even be reached
                        {
                            "contentDetails": {"videoId": "vid_never_reached"},
                            "snippet": {"publishedAt": "2026-10-01T12:00:00Z"},
                        },
                    ]
                },
            )
        if "/youtube/v3/videos" in url_str:
            assert "vid_brand_new" in url_str
            assert "vid_never_reached" not in url_str
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "vid_brand_new",
                            "snippet": {
                                "title": "Brand New Bastar Travel Guide",
                                "publishedAt": "2026-10-07T12:00:00Z",
                            },
                            "contentDetails": {"duration": "PT3M00S"},
                            "status": {"privacyStatus": "public"},
                            "statistics": {"viewCount": "50"},
                        }
                    ]
                },
            )
        return httpx.Response(404, json={})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="mock-api-key", http_client=mock_client)
    sync_service = YouTubeSyncService(session, client=client, provider=YouTubeAdapter(client=client))

    res = await sync_service.sync_account(account.id)
    assert res.discovered == 1
    assert res.created == 1

    # Verify only the new video exists
    contents = session.scalars(
        select(SocialContent).where(SocialContent.social_account_id == account.id)
    ).all()
    assert len(contents) == 1
    assert contents[0].provider_content_id == "vid_brand_new"


@pytest.mark.asyncio
async def test_sync_ineligible_account_raises_account_not_accepted(session: Session):
    creator = Creator(handle="unapproved_user", display_name="Unapproved", status=CreatorStatus.PENDING.value)
    session.add(creator)
    session.flush()

    unaccepted_acc = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="@unapproved_user",
        status=SocialAccountStatus.PENDING.value,
        is_sync_enabled=False,
    )
    session.add(unaccepted_acc)
    session.commit()

    sync_service = YouTubeSyncService(session)

    with pytest.raises(AccountNotAcceptedError):
        await sync_service.sync_account(unaccepted_acc.id)


@pytest.mark.asyncio
async def test_sync_quota_exceeded_handled_gracefully(session: Session):
    creator, account = create_eligible_creator_and_account(session)

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            403,
            json={
                "error": {
                    "code": 403,
                    "message": "Quota exceeded for quota metric.",
                    "errors": [{"reason": "quotaExceeded"}],
                }
            },
        )

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key="mock-api-key", http_client=mock_client)
    sync_service = YouTubeSyncService(session, client=client, provider=YouTubeAdapter(client=client))

    res = await sync_service.sync_account(account.id)

    assert res.status == SyncStatus.FAILED.value
    assert "quota" in res.error.lower()

    # Verify sync state records failure
    sync_state = session.scalar(
        select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id)
    )
    assert sync_state is not None
    assert sync_state.sync_status == SyncStatus.FAILED.value
    assert "quota" in sync_state.last_error.lower()


@pytest.mark.asyncio
async def test_sync_security_no_api_key_leak(session: Session):
    secret_api_key = "AIzaSySuperSecretKeyLeakCheck999"
    creator, account = create_eligible_creator_and_account(session)

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "/youtube/v3/playlistItems" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "contentDetails": {"videoId": "vid_leak_1"},
                            "snippet": {"publishedAt": "2026-10-05T12:00:00Z"},
                        }
                    ]
                },
            )
        if "/youtube/v3/videos" in url_str:
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": "vid_leak_1",
                            "snippet": {
                                "title": "Bastar Guide",
                                "publishedAt": "2026-10-05T12:00:00Z",
                            },
                            "contentDetails": {"duration": "PT3M00S"},
                            "status": {"privacyStatus": "public"},
                            "statistics": {"viewCount": "100"},
                        }
                    ]
                },
            )
        return httpx.Response(404, json={})

    mock_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    client = YouTubeClient(api_key=secret_api_key, http_client=mock_client)
    sync_service = YouTubeSyncService(session, client=client, provider=YouTubeAdapter(client=client))

    await sync_service.sync_account(account.id)

    # Check content metadata
    content = session.scalar(
        select(SocialContent).where(SocialContent.provider_content_id == "vid_leak_1")
    )
    assert content is not None
    assert secret_api_key not in json.dumps(content.metadata_json)

    # Check sync state cursor
    sync_state = session.scalar(
        select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account.id)
    )
    assert sync_state is not None
    assert secret_api_key not in (sync_state.cursor or "")

    # Check outbox events
    outbox = session.scalars(
        select(OutboxEvent).where(OutboxEvent.aggregate_id == account.id)
    ).all()
    for ev in outbox:
        assert secret_api_key not in json.dumps(ev.payload)
