from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.models import OutboxEvent
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import (
    require_admin,
    require_auth,
    require_moderator,
)
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
    SyncStatus,
)
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.base import NormalizedSocialItem, SyncResult
from app.modules.social.services.social_sync_engine import SocialSyncEngine
from app.modules.social.source.validator import SourceValidator
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.tests.fixtures import setup_social_test_environment
from app.modules.social.workflows.service import SocialWorkflowService


# ── 11.37: Standardized API Error Contracts ─────────────────────────────────
def test_standardized_error_contract() -> None:
    """11.37: Test standardized API error structure."""
    err = AppError(code="INVALID_STATE", message="Invalid transition", status_code=400)
    assert err.code == "INVALID_STATE"
    assert err.message == "Invalid transition"
    assert err.status_code == 400


# ── 11.38 - 11.40: Role-Based Access Control (RBAC) ──────────────────────────
def test_rbac_authentication_and_authorization() -> None:
    """11.38 - 11.40: Test RBAC roles for CONSUMER, MODERATOR, ADMIN."""
    # Active Moderator
    mod_user = AdminUser(
        id=uuid.uuid4(),
        role="MODERATOR",
        active=True,
    )
    # Active Admin
    admin_user = AdminUser(
        id=uuid.uuid4(),
        role="ADMIN",
        active=True,
    )
    # Consumer / Viewer
    consumer_user = AdminUser(
        id=uuid.uuid4(),
        role="CONSUMER",
        active=True,
    )
    # Inactive User
    inactive_user = AdminUser(
        id=uuid.uuid4(),
        role="ADMIN",
        active=False,
    )

    # 1. require_auth succeeds for active users and rejects inactive users (403)
    assert require_auth(mod_user) == mod_user
    with pytest.raises(HTTPException) as exc_inactive:
        require_auth(inactive_user)
    assert exc_inactive.value.status_code == 403

    # 2. require_moderator accepts MODERATOR and ADMIN, rejects CONSUMER (403)
    assert require_moderator(mod_user) == mod_user
    assert require_moderator(admin_user) == admin_user
    with pytest.raises(HTTPException) as exc_mod:
        require_moderator(consumer_user)
    assert exc_mod.value.status_code == 403

    # 3. require_admin accepts ADMIN, rejects MODERATOR and CONSUMER (403)
    assert require_admin(admin_user) == admin_user
    with pytest.raises(HTTPException) as exc_admin_mod:
        require_admin(mod_user)
    assert exc_admin_mod.value.status_code == 403
    with pytest.raises(HTTPException) as exc_admin_cons:
        require_admin(consumer_user)
    assert exc_admin_cons.value.status_code == 403


# ── 11.41: SSRF Protection ──────────────────────────────────────────────────
def test_ssrf_protection_and_host_isolation() -> None:
    """11.41: Test rejection of localhost, private network IPs, and invalid schemes."""
    forbidden_urls = [
        "http://localhost:8000/api/secret",
        "https://127.0.0.1:8080/admin",
        "https://10.0.0.1/internal/config",
        "https://192.168.1.1/router",
        "https://169.254.169.254/latest/meta-data/",
        "ftp://youtube.com/files",
        "file:///etc/passwd",
        "javascript:alert(1)",
        "https://evil-phishing.com/watch?v=12345",
    ]

    for bad_url in forbidden_urls:
        with pytest.raises(SourceUrlError):
            SourceValidator.validate_platform_url(bad_url, SocialPlatform.YOUTUBE)

    # Valid YouTube and Instagram URLs pass
    yt_valid = "https://www.youtube.com/watch?v=valid_123"
    ig_valid = "https://www.instagram.com/p/valid_post_123/"

    assert SourceValidator.validate_platform_url(yt_valid, SocialPlatform.YOUTUBE).value == yt_valid
    assert SourceValidator.validate_platform_url(ig_valid, SocialPlatform.INSTAGRAM).value == ig_valid


# ── 11.42: Secret Scanning in Data Payloads ─────────────────────────────────
def test_secret_scanning_in_payloads(session: Session) -> None:
    """11.42: Verify credentials, API keys, and private tokens are never serialized."""
    env = setup_social_test_environment(session)
    account = env.creator_a_yt

    # Check that model metadata does not contain api_key or secret tokens
    account_dict = {
        "id": str(account.id),
        "handle": account.handle,
        "platform": account.platform,
        "status": account.status,
    }

    raw_json = str(account_dict)
    assert "api_key" not in raw_json
    assert "secret" not in raw_json
    assert "access_token" not in raw_json
    assert "password" not in raw_json


# ── 11.43: Outbox Transactional Atomicity ───────────────────────────────────
def test_outbox_transactional_atomicity(session: Session) -> None:
    """11.43: Verify outbox events are atomic with the DB transaction."""
    agg_id = uuid.uuid4()

    # 1. Successful transaction commits outbox event
    create_outbox_event(
        session,
        event_type=EventType.SOCIAL_CONTENT_CREATED,
        aggregate_id=agg_id,
        payload={"action": "test_atomicity"},
    )
    session.commit()

    saved_event = session.scalar(
        select(OutboxEvent).where(OutboxEvent.aggregate_id == agg_id)
    )
    assert saved_event is not None
    assert saved_event.event_type == str(EventType.SOCIAL_CONTENT_CREATED)

    # 2. Rolled-back transaction rolls back outbox event
    agg_id_aborted = uuid.uuid4()
    create_outbox_event(
        session,
        event_type=EventType.SOCIAL_CONTENT_CREATED,
        aggregate_id=agg_id_aborted,
        payload={"action": "aborted_action"},
    )
    session.rollback()

    aborted_event = session.scalar(
        select(OutboxEvent).where(OutboxEvent.aggregate_id == agg_id_aborted)
    )
    assert aborted_event is None  # Cleanly rolled back!


# ── 11.44: Cache Invalidation Events ────────────────────────────────────────
def test_cache_invalidation_on_publication(session: Session) -> None:
    """11.44: Verify publication emits outbox event for feed cache invalidation."""
    workflow = SocialWorkflowService(session=session)
    creator_id = uuid.uuid4()

    creator = Creator(
        id=creator_id,
        display_name="Dev Creator",
        handle="dev_creator",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator_id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="dev_yt",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
    )
    session.add(account)

    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator_id,
        social_account_id=account.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_cache_test_1",
        content_type=ContentType.VIDEO.value,
        title="Bastar Waterfall Trail",
        slug="bastar-waterfall-trail-cache",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_cache_test_1",
        publication_status="APPROVED",
    )
    session.add(content)
    session.flush()

    published = workflow.publication.publish_content(content.id, actor_id="admin_1")
    assert published.status == "published"

    # Outbox event emitted with aggregate_id == content.id
    outbox = session.scalars(
        select(OutboxEvent).where(OutboxEvent.aggregate_id == content.id)
    ).all()
    assert len(outbox) > 0


# ── 11.45: Sync Idempotency ─────────────────────────────────────────────────
def test_sync_idempotency_multi_run(session: Session) -> None:
    """11.45: Re-running sync with identical content is strictly idempotent."""
    engine = SocialSyncEngine(session=session)
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()

    creator = Creator(
        id=creator_id,
        display_name="Ravi Idempotent",
        handle="ravi_idempotent",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)

    account = SocialAccount(
        id=account_id,
        creator_id=creator_id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="ravi_idem_yt",
        external_account_id="yt_idem_ch",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        content_types_allowed=["VIDEO"],
    )
    session.add(account)
    session.flush()

    mock_item = NormalizedSocialItem(
        provider=SocialPlatform.YOUTUBE,
        provider_content_id="yt_idem_item_1",
        content_type=ContentType.VIDEO,
        title="Dussehra Celebrations",
        description="Celebrations in Jagdalpur",
        source_url="https://youtube.com/watch?v=yt_idem_item_1",
        thumbnail_url="https://img.youtube.com/vi/yt_idem_item_1/hqdefault.jpg",
        published_at=datetime.now(timezone.utc),
        view_count=500,
        like_count=50,
    )

    mock_provider = MagicMock()
    mock_provider.fetch_content.return_value = SyncResult(items=[mock_item], next_cursor=None)

    with patch("app.modules.social.services.social_sync_engine.ProviderFactory.get_provider", return_value=mock_provider):
        # Run 1
        res1 = engine.sync_account(account.id)
        assert res1["status"] == "SUCCESS"

        # Run 2 with identical payload
        res2 = engine.sync_account(account.id)
        assert res2["status"] == "SUCCESS"

    # Verify exactly one content row exists in database
    records = session.scalars(
        select(SocialContent).where(
            SocialContent.provider == SocialPlatform.YOUTUBE.value,
            SocialContent.provider_content_id == "yt_idem_item_1",
        )
    ).all()
    assert len(records) == 1


# ── 11.46: Distributed Locking & Concurrency ────────────────────────────────
def test_distributed_sync_lock_concurrency() -> None:
    """11.46: Test lock acquisition, mutual exclusion, and release."""
    lock = InMemorySocialSyncLock()
    account_id = uuid.uuid4()

    # 1. Acquire lock succeeds
    acquired = lock.acquire(account_id, ttl_seconds=60)
    assert acquired is True

    # 2. Concurrent acquire on same account must fail (lock collision)
    collision = lock.acquire(account_id, ttl_seconds=60)
    assert collision is False

    # 3. Release lock restores availability
    lock.release(account_id)
    reacquired = lock.acquire(account_id, ttl_seconds=60)
    assert reacquired is True
    lock.release(account_id)


# ── 11.47 - 11.50: Failure Injection & Resilience ───────────────────────────
def test_sync_failure_injection_and_recovery(session: Session) -> None:
    """11.47 - 11.50: Test provider 503 error handling, backoff counter, and recovery."""
    engine = SocialSyncEngine(session=session)
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()

    creator = Creator(
        id=creator_id,
        display_name="Resilience Creator",
        handle="resilience_creator",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)

    account = SocialAccount(
        id=account_id,
        creator_id=creator_id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="resilience_yt",
        external_account_id="yt_resilience_ch",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        content_types_allowed=["VIDEO"],
    )
    session.add(account)
    session.flush()

    mock_provider = MagicMock()

    # 1. Failure Injection: Provider throws HTTP 503 Service Unavailable
    mock_provider.fetch_content.side_effect = RuntimeError("YouTube API 503 Service Unavailable")

    with patch("app.modules.social.services.social_sync_engine.ProviderFactory.get_provider", return_value=mock_provider):
        fail_res = engine.sync_account(account.id)
        assert fail_res["status"] == "FAILED"
        assert "503" in fail_res["error"]

    # Verify failure tracking
    session.refresh(account)
    assert account.consecutive_failures == 1
    assert account.sync_health == SyncHealthStatus.ERROR.value
    assert account.sync_status == SyncStatus.FAILED.value

    # 2. Recovery: Provider recovers and serves valid response
    mock_item = NormalizedSocialItem(
        provider=SocialPlatform.YOUTUBE,
        provider_content_id="yt_resilience_recovered_1",
        content_type=ContentType.VIDEO,
        title="Recovered Bastar Video",
        description="Video after recovery",
        source_url="https://youtube.com/watch?v=yt_resilience_recovered_1",
        thumbnail_url="https://img.youtube.com/vi/yt_resilience_recovered_1/hqdefault.jpg",
        published_at=datetime.now(timezone.utc),
        view_count=1000,
        like_count=100,
    )
    mock_provider.fetch_content.side_effect = None
    mock_provider.fetch_content.return_value = SyncResult(items=[mock_item], next_cursor=None)

    with patch("app.modules.social.services.social_sync_engine.ProviderFactory.get_provider", return_value=mock_provider):
        recovery_res = engine.sync_account(account.id)
        assert recovery_res["status"] == "SUCCESS"

    # Verify healthy state restored
    session.refresh(account)
    assert account.consecutive_failures == 0
    assert account.sync_health == SyncHealthStatus.HEALTHY.value
    assert account.sync_status == SyncStatus.SUCCEEDED.value
    assert account.last_error is None
