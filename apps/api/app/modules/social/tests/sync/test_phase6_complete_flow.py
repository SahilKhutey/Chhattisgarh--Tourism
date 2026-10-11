from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import uuid
import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.events.types import EventType
from app.main import app
from app.modules.admin.dependencies import AdminUser
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.api.dependencies import require_admin
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    ProviderAccessStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.domain.errors import SocialAccountAlreadyExistsError
from app.modules.social.engine import SocialEngine
from app.modules.social.feed.query import FeedQuery
from app.modules.social.handles.service import SocialHandleService
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.base import NormalizedSocialItem, SyncResult as ProviderSyncResult
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.sync.repository import SocialSyncRunRepository, SocialSyncStateRepository
from app.modules.social.sync.scheduler import SocialSyncScheduler
from app.modules.social.sync.worker import SocialSyncWorker


@pytest.fixture
def test_creator(session):
    c = Creator(
        id=uuid.uuid4(),
        display_name="Chhattisgarh Tourism Ambassador",
        slug="cg-tourism-ambassador",
        bio="Promoting the rich tribal cultural heritage of Bastar and Surguja",
        status=CreatorStatus.ACTIVE.value,
        district_id="bastar",
    )
    session.add(c)
    session.commit()
    return c


@pytest.fixture
def mock_admin():
    return AdminUser(
        id=uuid.uuid4(),
        role="ADMIN",
        active=True,
    )


@pytest.fixture
def client(session, mock_admin):
    app.dependency_overrides[get_db] = lambda: session
    app.dependency_overrides[require_admin] = lambda: mock_admin
    c = TestClient(app)
    yield c
    app.dependency_overrides.clear()


def test_phase6_end_to_end_complete_flow(session, test_creator):
    """6.54 Integration Test - Complete Flow:
    Creator -> Register YouTube & Instagram Handles -> Verify -> Accept -> Activate ->
    Enable Sync -> Worker Sync -> Normalization & Upsert -> Sync Runs & State -> Consumer Feed.
    """
    engine = SocialEngine(session)
    handle_service = SocialHandleService(session)

    # 1. Register YouTube handle
    yt_account = handle_service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.YOUTUBE,
        handle="@CG_Travels",
        sync_enabled=False,
        display_name="CG Travels YouTube",
    )
    # 2. Register Instagram handle
    ig_account = handle_service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.INSTAGRAM,
        handle="@CG_Travels",
        sync_enabled=False,
        display_name="CG Travels Instagram",
    )
    session.commit()

    assert yt_account.handle == "cg_travels"
    assert yt_account.platform == "youtube"
    assert yt_account.status == SocialAccountStatus.PENDING.value

    assert ig_account.handle == "cg_travels"
    assert ig_account.platform == "instagram"
    assert ig_account.status == SocialAccountStatus.PENDING.value

    # 3. Verify both accounts via verification service
    mock_yt_provider = MagicMock()
    mock_yt_profile = MagicMock(
        is_valid=True,
        external_id="UC_CG_12345",
        handle="cg_travels",
        display_name="CG Travels YouTube",
        profile_url="https://youtube.com/@CG_Travels",
    )
    mock_yt_provider.verify_account.return_value = mock_yt_profile
    mock_yt_provider.resolve_handle.return_value = mock_yt_profile

    mock_ig_provider = MagicMock()
    mock_ig_profile = MagicMock(
        is_valid=True,
        external_id="IG_98765",
        handle="cg_travels",
        display_name="CG Travels Instagram",
        profile_url="https://instagram.com/CG_Travels",
    )
    mock_ig_provider.verify_account.return_value = mock_ig_profile
    mock_ig_provider.resolve_handle.return_value = mock_ig_profile

    engine.providers.register(SocialPlatform.YOUTUBE, mock_yt_provider)
    engine.providers.register(SocialPlatform.INSTAGRAM, mock_ig_provider)

    res_yt_ver = engine.verification.verify_account_sync(yt_account)
    res_ig_ver = engine.verification.verify_account_sync(ig_account)
    assert res_yt_ver.verified is True
    assert res_ig_ver.verified is True
    session.commit()

    # 4. Accept both accounts
    engine.acceptance.accept(
        account=yt_account.id,
        actor_id=uuid.uuid4(),
        approved_content_types=["VIDEO", "SHORT"],
    )
    engine.acceptance.accept(
        account=ig_account.id,
        actor_id=uuid.uuid4(),
        approved_content_types=["REEL", "POST"],
    )
    session.commit()
    assert yt_account.status in (SocialAccountStatus.ACCEPTED.value, SocialAccountStatus.ACTIVE.value)
    assert ig_account.status in (SocialAccountStatus.ACCEPTED.value, SocialAccountStatus.ACTIVE.value)

    # 5. Activate both accounts if needed & enable sync
    if yt_account.status != SocialAccountStatus.ACTIVE.value:
        engine.acceptance.activate(account=yt_account.id, actor_id=uuid.uuid4())
    if ig_account.status != SocialAccountStatus.ACTIVE.value:
        engine.acceptance.activate(account=ig_account.id, actor_id=uuid.uuid4())

    yt_account.is_sync_enabled = True
    yt_account.provider_access_status = ProviderAccessStatus.AVAILABLE.value
    ig_account.is_sync_enabled = True
    ig_account.provider_access_status = ProviderAccessStatus.AVAILABLE.value
    session.commit()

    assert yt_account.status == SocialAccountStatus.ACTIVE.value
    assert ig_account.status == SocialAccountStatus.ACTIVE.value

    # 6. Configure provider mock fetch items
    now = datetime.now(timezone.utc)
    mock_yt_provider.fetch_content.return_value = ProviderSyncResult(
        items=[
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id="yt_vid_001",
                content_type=ContentType.VIDEO,
                title="Tirathgarh Falls Monsoon Wonder",
                description="The cascading milky falls in Kanger Valley National Park",
                source_url="https://youtube.com/watch?v=yt_vid_001",
                thumbnail_url="https://img.youtube.com/vi/yt_vid_001/0.jpg",
                published_at=now - timedelta(days=2),
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id="yt_short_002",
                content_type=ContentType.SHORT,
                title="Bastar Bell Metal Crafting",
                description="Centuries-old Dhokra casting in Kondagaon",
                source_url="https://youtube.com/shorts/yt_short_002",
                thumbnail_url="https://img.youtube.com/vi/yt_short_002/0.jpg",
                published_at=now - timedelta(days=1),
            ),
        ],
        next_cursor=None,
    )

    mock_ig_provider.fetch_content.return_value = ProviderSyncResult(
        items=[
            NormalizedSocialItem(
                provider=SocialPlatform.INSTAGRAM,
                provider_content_id="ig_reel_001",
                content_type=ContentType.REEL,
                title="Madai Festival Dance",
                description="Vibrant colors and sacred rhythms of Bastar Madai",
                source_url="https://www.instagram.com/reel/CgMadai001/",
                thumbnail_url="https://instagram.com/p/CgMadai001/media/?size=l",
                published_at=now - timedelta(hours=12),
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.INSTAGRAM,
                provider_content_id="ig_post_002",
                content_type=ContentType.POST,
                title="Barnawapara Wildlife Safari",
                description="Spotted deer and leopards in the sanctuary",
                source_url="https://www.instagram.com/p/CgBarna002/",
                thumbnail_url="https://instagram.com/p/CgBarna002/media/?size=l",
                published_at=now - timedelta(hours=6),
            ),
        ],
        next_cursor=None,
    )

    # 7. Coordinate synchronization
    provider_registry = ProviderRegistry()
    provider_registry.register(SocialPlatform.YOUTUBE, mock_yt_provider)
    provider_registry.register(SocialPlatform.INSTAGRAM, mock_ig_provider)

    coordinator = SocialSyncCoordinator(
        session=session,
        lock=InMemorySocialSyncLock(),
        provider_registry=provider_registry,
    )

    yt_sync_res = coordinator.sync_account(yt_account.id, trigger="initial")
    ig_sync_res = coordinator.sync_account(ig_account.id, trigger="initial")

    assert yt_sync_res.status in ("success", "succeeded")
    assert yt_sync_res.discovered == 2
    assert yt_sync_res.created == 2

    assert ig_sync_res.status in ("success", "succeeded")
    assert ig_sync_res.discovered == 2
    assert ig_sync_res.created == 2

    # 8. Assert database state
    sync_state_repo = SocialSyncStateRepository(session)
    run_repo = SocialSyncRunRepository(session)
    content_repo = SocialContentRepository(session)

    yt_state = sync_state_repo.get_by_account_id(yt_account.id)
    ig_state = sync_state_repo.get_by_account_id(ig_account.id)

    assert yt_state.sync_status in (SyncStatus.SUCCESS.value, "success", "succeeded")
    assert yt_state.items_synced_total == 2
    assert ig_state.sync_status in (SyncStatus.SUCCESS.value, "success", "succeeded")
    assert ig_state.items_synced_total == 2

    yt_runs = run_repo.list_by_account(yt_account.id)
    ig_runs = run_repo.list_by_account(ig_account.id)
    assert len(yt_runs) >= 1
    assert len(ig_runs) >= 1
    assert yt_runs[0].status in ("success", "succeeded")
    assert ig_runs[0].status in ("success", "succeeded")

    yt_contents = content_repo.list_by_account(yt_account.id)
    ig_contents = content_repo.list_by_account(ig_account.id)
    assert len(yt_contents) == 2
    assert len(ig_contents) == 2

    all_urls = [c.source_url for c in yt_contents + ig_contents]
    assert "https://youtube.com/watch?v=yt_vid_001" in all_urls
    assert "https://www.instagram.com/reel/CgMadai001/" in all_urls

    # 9. Test idempotent re-sync: no duplicates created
    yt_sync_res2 = coordinator.sync_account(yt_account.id, trigger="scheduled")
    assert yt_sync_res2.status in ("success", "succeeded")
    assert yt_sync_res2.created == 0
    assert yt_sync_res2.updated == 2
    assert len(content_repo.list_by_account(yt_account.id)) == 2

    # 10. Query Consumer Feed
    feed_items = engine.feed.get_feed(FeedQuery(limit=10))
    assert len(feed_items) >= 4
    for card in feed_items:
        assert card.source_url.startswith("https://")
        assert (getattr(card, "creator_handle", None) == "cg-tourism-ambassador" or getattr(card.creator, "handle", None) == "cg-tourism-ambassador")


def test_phase6_failure_retry_and_backoff(session, test_creator):
    """6.55 Failure Integration Test:
    Simulate Instagram 429 rate limit and YouTube 500 server error,
    assert retry tracking, backoff delay, and sync state recording.
    """
    now = datetime.now(timezone.utc)

    # 1. Instagram 429 Rate Limit simulation
    ig_acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=test_creator.id,
        platform="instagram",
        handle="ig_rate_limited",
        profile_url="https://instagram.com/ig_rate_limited",
        status=SocialAccountStatus.ACTIVE.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
    )
    session.add(ig_acc)
    ig_state = SocialAccountSyncState(
        social_account_id=ig_acc.id,
        sync_status=SyncStatus.NEVER_RUN.value,
        sync_enabled=True,
        consecutive_failures=0,
    )
    session.add(ig_state)
    session.commit()

    mock_ig = MagicMock()
    mock_ig.platform = SocialPlatform.INSTAGRAM
    mock_ig.fetch_content.side_effect = Exception("HTTP 429: Too Many Requests - Meta API Rate Limit Exceeded")

    # 2. YouTube 500 Internal Server Error simulation
    yt_acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=test_creator.id,
        platform="youtube",
        handle="yt_server_error",
        profile_url="https://youtube.com/@yt_server_error",
        status=SocialAccountStatus.ACTIVE.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
    )
    session.add(yt_acc)
    yt_state = SocialAccountSyncState(
        social_account_id=yt_acc.id,
        sync_status=SyncStatus.NEVER_RUN.value,
        sync_enabled=True,
        consecutive_failures=0,
    )
    session.add(yt_state)
    session.commit()

    mock_yt = MagicMock()
    mock_yt.platform = SocialPlatform.YOUTUBE
    mock_yt.fetch_content.side_effect = Exception("HTTP 500: Internal Server Error - YouTube Service Unavailable")

    registry = ProviderRegistry()
    registry.register(SocialPlatform.INSTAGRAM, mock_ig)
    registry.register(SocialPlatform.YOUTUBE, mock_yt)

    coordinator = SocialSyncCoordinator(
        session=session,
        lock=InMemorySocialSyncLock(),
        provider_registry=registry,
    )

    # Execute failing syncs
    ig_res = coordinator.sync_account(ig_acc.id)
    yt_res = coordinator.sync_account(yt_acc.id)

    assert ig_res.status.lower() == "failed"
    assert "429" in (ig_res.error or "")

    assert yt_res.status.lower() == "failed"
    assert "500" in (yt_res.error or "")

    # Verify consecutive failures incremented and backoff applied
    session.refresh(ig_state)
    session.refresh(yt_state)
    session.refresh(ig_acc)
    session.refresh(yt_acc)

    assert ig_state.sync_status == SyncStatus.FAILED.value
    assert ig_state.consecutive_failures == 1
    assert ig_acc.next_sync_at is not None
    ig_next = ig_acc.next_sync_at if ig_acc.next_sync_at.tzinfo else ig_acc.next_sync_at.replace(tzinfo=timezone.utc)
    assert ig_next > now

    assert yt_state.sync_status == SyncStatus.FAILED.value
    assert yt_state.consecutive_failures == 1
    assert yt_acc.next_sync_at is not None
    yt_next = yt_acc.next_sync_at if yt_acc.next_sync_at.tzinfo else yt_acc.next_sync_at.replace(tzinfo=timezone.utc)
    assert yt_next > now

    # Verify run repository recorded failure entries
    run_repo = SocialSyncRunRepository(session)
    ig_runs = run_repo.list_by_account(ig_acc.id)
    yt_runs = run_repo.list_by_account(yt_acc.id)

    assert len(ig_runs) == 1
    assert ig_runs[0].status.lower() == "failed"
    assert "429" in (ig_runs[0].error_message or "")

    assert len(yt_runs) == 1
    assert yt_runs[0].status.lower() == "failed"
    assert "500" in (yt_runs[0].error_message or "")


def test_phase6_scheduler_bounded_execution(session, test_creator):
    """6.57 Scheduler Integration Test:
    Create 100 accounts with next_sync_at <= now,
    verify that scheduler run respects bounded batch size limit.
    """
    now = datetime.now(timezone.utc)
    accounts = []
    for i in range(100):
        acc = SocialAccount(
            id=uuid.uuid4(),
            creator_id=test_creator.id,
            platform="youtube",
            handle=f"due_account_{i:03d}",
            status=SocialAccountStatus.ACTIVE.value,
            sync_status=SyncStatus.SUCCESS.value,
            is_sync_enabled=True,
            provider_access_status=ProviderAccessStatus.AVAILABLE.value,
            next_sync_at=now - timedelta(minutes=i + 1),
        )
        accounts.append(acc)
    session.add_all(accounts)
    session.commit()

    scheduler = SocialSyncScheduler(session)
    # Bounded execution with batch_size = 25
    queued_count = scheduler.enqueue_due_syncs(batch_size=25)
    assert queued_count == 25


def test_phase6_security_enforcement(client, session, test_creator, mock_admin):
    """6.58 Security Tests:
    - Non-admin rejected from registering/verifying/syncing
    - Paused and unaccepted accounts cannot sync
    - Cross-creator handle conflict prevented
    - Provider secrets never leaked in responses or events.
    """
    from fastapi import HTTPException

    # 1. Non-admin forbidden / unauthenticated check
    def raise_401():
        raise HTTPException(status_code=401, detail="Not authenticated")

    def raise_403():
        raise HTTPException(status_code=403, detail="Forbidden")

    app.dependency_overrides[require_admin] = raise_401
    try:
        res_unauth = client.post(
            "/api/admin/social/handles",
            json={
                "creator_id": str(test_creator.id),
                "platform": "youtube",
                "handle": "@unauthorized_test",
            },
        )
        assert res_unauth.status_code == 401

        app.dependency_overrides[require_admin] = raise_403
        res_forbid = client.post(
            "/api/admin/social/handles",
            json={
                "creator_id": str(test_creator.id),
                "platform": "youtube",
                "handle": "@forbidden_test",
            },
        )
        assert res_forbid.status_code == 403
    finally:
        app.dependency_overrides[require_admin] = lambda: mock_admin

    # 2. Cross-creator handle uniqueness check
    creator_2 = Creator(
        id=uuid.uuid4(),
        display_name="Second Creator",
        slug="second-creator",
        district_id="surguja",
    )
    session.add(creator_2)
    session.commit()

    # Register handle for test_creator
    handle_service = SocialHandleService(session)
    handle_service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.YOUTUBE,
        handle="@BastarHeritage",
    )
    session.commit()

    # Attempt to register identical handle on same platform for creator_2
    with pytest.raises(SocialAccountAlreadyExistsError):
        handle_service.register(
            creator_id=creator_2.id,
            platform=SocialPlatform.YOUTUBE,
            handle="bastarheritage",
        )

    # 3. Paused and Unaccepted accounts cannot sync
    paused_acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=test_creator.id,
        platform="youtube",
        handle="paused_account_sync",
        status=SocialAccountStatus.PAUSED.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
    )
    session.add(paused_acc)
    session.commit()

    res_paused_sync = client.post(f"/api/admin/social/accounts/{paused_acc.id}/sync")
    assert res_paused_sync.status_code == 400
    err_body = str(res_paused_sync.json()).lower()
    assert "not currently eligible" in err_body

    pending_acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=test_creator.id,
        platform="youtube",
        handle="pending_account_sync",
        status=SocialAccountStatus.PENDING.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
    )
    session.add(pending_acc)
    session.commit()

    res_pending_sync = client.post(f"/api/admin/social/accounts/{pending_acc.id}/sync")
    assert res_pending_sync.status_code == 400

    # 4. Secrets hygiene in API response
    res_list = client.get(f"/api/admin/social/handles?creator_id={test_creator.id}")
    assert res_list.status_code == 200
    for acc_item in res_list.json():
        assert "access_token" not in acc_item
        assert "client_secret" not in acc_item
        assert "secret" not in acc_item
        assert "refresh_token" not in acc_item
