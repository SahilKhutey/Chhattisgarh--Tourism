from __future__ import annotations

import uuid
from unittest.mock import MagicMock
import pytest
from sqlalchemy.orm import Session

from app.modules.social.config import SocialSettings, get_social_settings
from app.modules.social.domain.enums import (
    CreatorStatus,
    ModerationStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SyncHealthStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.observability import (
    METRIC_NAMES,
    get_metric_value,
    get_metrics_snapshot,
    get_operational_dashboard_data,
    increment_metric,
    log_developer_event,
    redact_sensitive_data,
    reset_metrics_for_testing,
)


def test_feature_flags_production_configuration() -> None:
    """
    Validates Feature Flags according to Section 12.35:
    SOCIAL_ENGINE_ENABLED
    SOCIAL_SYNC_ENABLED
    SOCIAL_YOUTUBE_ENABLED
    SOCIAL_INSTAGRAM_ENABLED
    SOCIAL_FEED_ENABLED
    SOCIAL_AUTO_PUBLISH_ENABLED
    """
    settings = SocialSettings(
        social_engine_enabled=True,
        social_sync_enabled=True,
        social_feed_enabled=True,
        social_auto_publish_enabled=False,  # Must remain false by default until editorial confidence
        social_youtube_enabled=True,
        social_instagram_enabled=True,
        youtube_api_key="mock_yt_key_12345",
        instagram_client_id="mock_ig_id",
        instagram_client_secret="mock_ig_secret",
    )
    assert settings.social_engine_enabled is True
    assert settings.social_sync_enabled is True
    assert settings.social_feed_enabled is True
    assert settings.social_auto_publish_enabled is False
    assert settings.social_youtube_enabled is True
    assert settings.social_instagram_enabled is True

    # Validate provider configuration checks
    settings.validate_youtube_configuration()
    settings.validate_instagram_configuration()


def test_feature_flags_validation_errors() -> None:
    """Verifies that missing credentials raise descriptive configuration errors."""
    with pytest.raises(ValueError, match="YOUTUBE_API_KEY is required"):
        bad_yt = SocialSettings(social_youtube_enabled=True, youtube_api_key=None)
        bad_yt.validate_youtube_configuration()

    with pytest.raises(ValueError, match="INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET are required"):
        bad_ig = SocialSettings(social_instagram_enabled=True, instagram_client_id=None)
        bad_ig.validate_instagram_configuration()


def test_observability_metrics_counters() -> None:
    """
    Validates that all 12 specified observability counters (Section 12.32) function correctly:
    social_sync_total
    social_sync_success_total
    social_sync_failure_total
    social_provider_request_total
    social_provider_error_total
    social_rate_limit_total
    social_content_created_total
    social_content_updated_total
    social_content_hidden_total
    social_feed_request_total
    social_feed_cache_hit_total
    social_source_click_total
    """
    reset_metrics_for_testing()

    for metric_name in METRIC_NAMES:
        increment_metric(metric_name, count=5)
        assert get_metric_value(metric_name) == 5

    # Incremental update
    increment_metric("social_feed_request_total", count=10)
    assert get_metric_value("social_feed_request_total") == 15

    # Label-aware metric recording
    increment_metric("social_sync_total", count=1, labels={"platform": "youtube"})
    snapshot = get_metrics_snapshot()
    assert snapshot["social_sync_total"] == 6
    assert 'social_sync_total{platform="youtube"}' in snapshot


def test_operational_dashboard_data_aggregation(session: Session) -> None:
    """
    Validates operational health dashboard aggregation (Section 12.33).
    """
    # Seed test entities
    creator_1 = Creator(
        id=uuid.uuid4(),
        display_name="Raipur Vlogger",
        handle="raipur_vlogger",
        district_id="raipur",
        status=CreatorStatus.ACTIVE,
    )
    creator_2 = Creator(
        id=uuid.uuid4(),
        display_name="Durg Trekker",
        handle="durg_trekker",
        district_id="durg",
        status=CreatorStatus.PENDING,
    )
    session.add_all([creator_1, creator_2])
    session.flush()

    account_1 = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator_1.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="raipur_vlog_yt",
        status=SocialAccountStatus.ACTIVE.value,
        sync_health=SyncHealthStatus.HEALTHY.value,
    )
    account_2 = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator_1.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle="raipur_vlog_ig",
        status=SocialAccountStatus.ACTIVE.value,
        sync_health=SyncHealthStatus.ERROR.value,
    )
    session.add_all([account_1, account_2])
    session.flush()

    content_pub = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator_1.id,
        social_account_id=account_1.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_purkhouti_muktangan",
        content_type="VIDEO",
        title="Purkhouti Muktangan Cultural Park",
        slug="purkhouti-muktangan-cultural-park",
        source_url="https://youtube.com/watch?v=yt_purkhouti_muktangan",
        publication_status=SocialContentStatus.PUBLISHED.value,
        moderation_status=ModerationStatus.APPROVED.value,
    )
    content_pending = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator_1.id,
        social_account_id=account_1.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_purkhouti_raw",
        content_type="VIDEO",
        title="Raw Purkhouti Footage",
        slug="raw-purkhouti-footage",
        source_url="https://youtube.com/watch?v=yt_purkhouti_raw",
        publication_status=SocialContentStatus.DISCOVERED.value,
        moderation_status=ModerationStatus.PENDING.value,
    )
    content_deleted = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator_1.id,
        social_account_id=account_1.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_removed_clip",
        content_type="VIDEO",
        title="Deleted Clip",
        slug="deleted-clip-test",
        source_url="https://youtube.com/watch?v=yt_removed_clip",
        publication_status=SocialContentStatus.SOURCE_DELETED.value,
    )
    session.add_all([content_pub, content_pending, content_deleted])
    session.flush()

    dashboard = get_operational_dashboard_data(session)

    assert dashboard["active_creators"] >= 1
    assert dashboard["active_accounts"] >= 2
    assert dashboard["failed_syncs"] >= 1
    assert dashboard["content_published"] >= 1
    assert dashboard["pending_moderation"] >= 1
    assert dashboard["unavailable_sources"] >= 1
    assert dashboard["providers"]["youtube"]["healthy"] is True
    assert dashboard["providers"]["instagram"]["healthy"] is True


def test_developer_logging_and_secret_redaction() -> None:
    """
    Validates developer log structuring and secret redaction (Section 12.34).
    """
    raw_error_message = (
        "Failed request to https://graph.facebook.com/v21.0/oauth?token=EAABwzL123SECRETTOKEN "
        "with key=AIzaSyD-KEY999 and password=SuperSecretPassword123"
    )
    redacted = redact_sensitive_data(raw_error_message)

    assert "EAABwzL123SECRETTOKEN" not in redacted
    assert "AIzaSyD-KEY999" not in redacted
    assert "SuperSecretPassword123" not in redacted
    assert "***REDACTED***" in redacted

    # Verify structured logging execution does not raise
    log_developer_event(
        request_id="req-12345",
        account_id="acc-67890",
        provider="youtube",
        operation="sync_videos",
        error_type="RateLimitExceeded",
        status_code=429,
        duration_ms=234.5,
        retry_count=2,
        message=raw_error_message,
    )
