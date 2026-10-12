from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
)
from app.events.models import OutboxEvent
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.policies.sync_policy import SocialSyncPolicy
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.workflows.service import SocialWorkflowService


def test_provider_quota_exceeded_with_backoff_calculation(session: Session) -> None:
    """
    Failure Injection: Provider quotaExceeded triggers backoff window and prevents subsequent sync.
    (Section 9.46: Rate Limit / Quota Protection)
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Quota Test Creator",
        slug="quota-test-creator",
        status=CreatorStatus.ACTIVE,
    )
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="quota_creator",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )
    session.add_all([creator, account])
    session.flush()

    lock = InMemorySocialSyncLock()
    mock_coordinator = MagicMock()
    mock_coordinator.sync_account.side_effect = RuntimeError("YouTube API Error: quotaExceeded (rate limit exceeded)")

    service = SocialWorkflowService(session=session, lock=lock)
    service.sync.coordinator = mock_coordinator

    # 1. Execute sync raises quota exception
    with pytest.raises(RuntimeError, match="quotaExceeded"):
        service.sync.execute_sync(account.id)

    # 2. Account should have quota backoff window set in metadata
    re_fetched = session.get(SocialAccount, account.id)
    assert re_fetched is not None
    quota_until = (re_fetched.metadata_json or {}).get("quota_exceeded_until")
    assert quota_until is not None
    assert SocialSyncPolicy.is_quota_limited(re_fetched) is True

    # 3. Test backoff calculation logic
    assert SocialSyncPolicy.calculate_backoff_seconds(0) == 0
    assert SocialSyncPolicy.calculate_backoff_seconds(1, base_seconds=60) == 60
    assert SocialSyncPolicy.calculate_backoff_seconds(2, base_seconds=60) == 120
    assert SocialSyncPolicy.calculate_backoff_seconds(3, base_seconds=60) == 240
    assert SocialSyncPolicy.calculate_backoff_seconds(10, base_seconds=60, max_seconds=3600) == 3600


def test_provider_timeout_during_verification_friendly_error(session: Session) -> None:
    """
    Failure Injection: Provider network timeout / 5xx triggers a friendly error and reverts status.
    (Section 9.14: Friendly Error Mapping)
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Timeout Creator",
        slug="timeout-creator",
        status=CreatorStatus.ACTIVE,
    )
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="timeout_user",
        status=SocialAccountStatus.PENDING.value,
    )
    session.add_all([creator, account])
    session.flush()

    mock_provider = MagicMock()
    mock_provider.verify_account.side_effect = TimeoutError("Connection to YouTube timed out after 30000ms")

    registry = ProviderRegistry()
    registry.register(SocialPlatform.YOUTUBE, mock_provider)

    service = SocialWorkflowService(session=session, provider_registry=registry)

    # Verification should catch the network timeout, log, and raise a 502 with a friendly message
    with pytest.raises(AppError) as exc_info:
        service.verification.verify_account(account.id, actor_id="admin-001")

    assert exc_info.value.status_code == 502
    assert "temporarily unavailable" in exc_info.value.message.lower()

    # Invariant: Account status remains PENDING and stores friendly error
    re_fetched = session.get(SocialAccount, account.id)
    assert re_fetched is not None
    assert re_fetched.status == SocialAccountStatus.PENDING.value
    meta = re_fetched.metadata_json or {}
    assert "temporarily unavailable" in meta.get("verification_error", "").lower()


def test_invalid_source_url_blocks_content_validation(session: Session) -> None:
    """
    Failure Injection: Ingested item with malicious / untrusted / malformed source URL is rejected.
    (Section 9.24: Content Validation & Anti-SSRF allowlist)
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="SSRF Test Creator",
        slug="ssrf-test-creator",
        status=CreatorStatus.ACTIVE,
    )
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="ssrf_tester",
        status=SocialAccountStatus.ACTIVE.value,
    )
    malicious_content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=account.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_malicious_001",
        content_type=ContentType.VIDEO.value,
        title="Suspicious Video",
        slug="suspicious-video-1",
        district_id="bastar",
        source_url="http://169.254.169.254/latest/meta-data/",  # Cloud metadata IP (SSRF)
        status=SocialContentStatus.DISCOVERED.value,
    )
    session.add_all([creator, account, malicious_content])
    session.flush()

    service = SocialWorkflowService(session=session)

    # Validation must reject disallowed domain with 422
    with pytest.raises(AppError) as exc_info:
        service.content.validate_content(malicious_content.id)

    assert exc_info.value.status_code == 422
    assert "invalid source url" in exc_info.value.message.lower()

    # Status must NOT transition to VALIDATED
    re_fetched = session.get(SocialContent, malicious_content.id)
    assert re_fetched is not None
    assert re_fetched.status == SocialContentStatus.DISCOVERED.value


def test_transaction_rollback_outbox_event_consistency(session: Session) -> None:
    """
    Failure Injection: Database failure during workflow causes transaction rollback
    and ensures no orphaned OutboxEvent rows are persisted.
    (Section 9.71: Transactional Outbox Pattern)
    """
    service = SocialWorkflowService(session=session)

    initial_outbox_count = session.query(OutboxEvent).count()

    # Attempt to onboard creator but simulate a transaction failure
    try:
        creator = service.creators.onboard_creator(
            display_name="Rollback Creator",
            slug="rollback-creator",
            district_id="bastar",
        )
        # Check event was staged in this transaction
        assert session.query(OutboxEvent).count() > initial_outbox_count

        # Simulate unexpected system failure during transaction
        raise RuntimeError("Simulated unhandled DB write failure")
    except RuntimeError:
        session.rollback()

    # Ensure no orphaned outbox events leaked after rollback
    final_outbox_count = session.query(OutboxEvent).count()
    assert final_outbox_count == initial_outbox_count
