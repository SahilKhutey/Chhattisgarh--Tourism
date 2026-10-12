from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.social.content.service import SocialContentService
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    CulturalSensitivityLevel,
    SocialAccountStatus,
    SocialContentStatus,
    SocialContentType,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.base import SocialAccountProfile
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.providers.youtube.classifier import YouTubeContentClassifier
from app.modules.social.providers.youtube.errors import (
    YouTubeAccountNotFoundError,
    YouTubeAPIError,
    YouTubeAuthenticationError,
    YouTubeQuotaExceededError,
    YouTubeRateLimitError,
    YouTubeUnavailableError,
)
from app.modules.social.providers.youtube.parser import parse_youtube_profile
from app.modules.social.sync.coordinator import SocialContentNormalizer
from app.modules.social.workflows.service import SocialWorkflowService


# -----------------------------------------------------------------------------
# 11.17 Provider Verification Tests
# -----------------------------------------------------------------------------
def test_provider_verification(session: Session) -> None:
    mock_provider = MagicMock()
    mock_provider.verify_account.return_value = SocialAccountProfile(
        handle="RaviBastar",
        display_name="Ravi Bastar",
        provider_channel_id="UC_ravi_123",
        is_valid=True,
    )

    registry = ProviderRegistry()
    registry.register(SocialPlatform.YOUTUBE, mock_provider)

    service = SocialWorkflowService(session=session, provider_registry=registry)
    creator = service.creators.onboard_creator(
        display_name="Ravi Bastar",
        slug="ravi_verification_test",
        district_id="bastar",
        auto_activate=True,
    )
    account = service.accounts.register_account(
        creator_id=creator.id,
        raw_input="https://youtube.com/@RaviBastar",
    )

    verified = service.verification.verify_account(account.id)
    assert verified.status == SocialAccountStatus.VERIFIED.value
    assert verified.external_account_id == "UC_ravi_123"
    assert verified.display_name == "Ravi Bastar"


# -----------------------------------------------------------------------------
# 11.18 Provider Failure Tests & Error Mappings
# -----------------------------------------------------------------------------
def test_provider_failure_mappings() -> None:
    # 404 -> Account/Content not found
    err_404 = YouTubeAccountNotFoundError("Channel not found on YouTube", status_code=404)
    assert err_404.status_code == 404

    # 400 -> Provider validation error
    err_400 = YouTubeAPIError("Invalid parameter in YouTube request", status_code=400)
    assert err_400.status_code == 400

    # 401/403 -> Authentication / Permission
    err_401 = YouTubeAuthenticationError("Invalid API Key", status_code=401)
    assert err_401.status_code == 401

    # 429 -> Rate limit
    err_429 = YouTubeRateLimitError("Rate limit exceeded", status_code=429)
    assert err_429.status_code == 429

    # Quota limit
    err_quota = YouTubeQuotaExceededError("Daily project quota exceeded", status_code=403)
    assert err_quota.status_code == 403

    # 5xx / Temporary service unavailable
    err_503 = YouTubeUnavailableError("Service unavailable", status_code=503)
    assert err_503.status_code == 503


# -----------------------------------------------------------------------------
# 11.19 - 11.21 YouTube Parser, Pagination & Batch Tests
# -----------------------------------------------------------------------------
def test_youtube_parser() -> None:
    # Handle URL
    kind, val = parse_youtube_profile("https://www.youtube.com/@RaviBastar")
    assert kind == "handle"
    assert val == "RaviBastar"

    # Channel ID URL
    kind, val = parse_youtube_profile("https://youtube.com/channel/UC1234567890123456789012")
    assert kind == "channel_id"
    assert val == "UC1234567890123456789012"

    # Direct handle string
    kind, val = parse_youtube_profile("@BastarScout")
    assert kind == "handle"
    assert val == "BastarScout"


def test_youtube_batching_constraints() -> None:
    video_ids = [f"vid_{i}" for i in range(125)]
    batch_size = 50
    batches = [video_ids[i:i + batch_size] for i in range(0, len(video_ids), batch_size)]

    assert len(batches) == 3
    assert len(batches[0]) == 50
    assert len(batches[1]) == 50
    assert len(batches[2]) == 25


# -----------------------------------------------------------------------------
# 11.22 Shorts Classification Tests
# -----------------------------------------------------------------------------
def test_shorts_classification_policy() -> None:
    classifier = YouTubeContentClassifier(max_short_duration_seconds=180)

    # 1. Video with duration <= 180s classified as SHORT
    short_content = classifier.classify(
        duration_seconds=45,
        title="Quick view of Chitrakote Falls",
    )
    assert short_content == SocialContentType.SHORT

    # 2. Explicit #shorts tag classified as SHORT
    tagged_short = classifier.classify(
        duration_seconds=59,
        title="Monsoon Waterfalls #Shorts",
    )
    assert tagged_short == SocialContentType.SHORT

    # 3. Video with duration > 180s classified as VIDEO
    long_video = classifier.classify(
        duration_seconds=600,
        title="Full Documentary: Bastar Tribal Life",
    )
    assert long_video == SocialContentType.VIDEO


# -----------------------------------------------------------------------------
# 11.23 - 11.25 Content Deduplication & Editorial Field Preservation
# -----------------------------------------------------------------------------
def test_editorial_field_preservation_and_deduplication(session: Session) -> None:
    service = SocialContentService(session=session)

    from app.modules.social.models.social_account import SocialAccount
    from app.modules.social.services.social_sync_engine import SocialSyncEngine
    from app.modules.social.providers.base import SyncResult, NormalizedSocialItem
    from unittest.mock import patch, MagicMock

    engine = SocialSyncEngine(session=session)

    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()
    place_id = uuid.uuid4()

    creator = Creator(
        id=creator_id,
        display_name="Praveen Bastar",
        handle="praveen_bastar_dedup",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)

    account = SocialAccount(
        id=account_id,
        creator_id=creator_id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="praveen_yt",
        external_account_id="yt_channel_praveen",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        content_types_allowed=["VIDEO", "SHORT"],
    )
    session.add(account)
    session.flush()

    # 1. First sync run introduces content item
    mock_item_1 = NormalizedSocialItem(
        provider=SocialPlatform.YOUTUBE,
        provider_content_id="yt_teerathgarh_4k",
        content_type=ContentType.VIDEO,
        title="Sunrise at Teerathgarh Falls",
        description="Original description",
        source_url="https://youtube.com/watch?v=yt_teerathgarh_4k",
        thumbnail_url="https://img.youtube.com/vi/yt_teerathgarh_4k/hqdefault.jpg",
        published_at=datetime.now(timezone.utc),
        view_count=100,
        like_count=10,
    )

    mock_provider = MagicMock()
    mock_provider.fetch_content.return_value = SyncResult(items=[mock_item_1], next_cursor="page2")

    with patch("app.modules.social.services.social_sync_engine.ProviderFactory.get_provider", return_value=mock_provider):
        res1 = engine.sync_account(account.id)
        assert res1["status"] == "SUCCESS"
        assert res1["items_synced"] == 1

    content = session.scalar(
        select(SocialContent).where(
            SocialContent.provider == SocialPlatform.YOUTUBE.value,
            SocialContent.provider_content_id == "yt_teerathgarh_4k",
        )
    )
    assert content is not None
    assert content.views_count == 100
    assert content.likes_count == 10

    # 2. Editorial team curates the content (attaches place, tags, sensitivity)
    content.place_id = place_id
    content.place_slug = "teerathgarh-falls"
    content.place_name = "Teerathgarh Falls"
    content.cultural_sensitivity = CulturalSensitivityLevel.COMMUNITY_PROTECTED.value
    content.district_id = "bastar"
    session.flush()

    # 3. Subsequent provider sync runs with updated engagement numbers
    mock_item_updated = NormalizedSocialItem(
        provider=SocialPlatform.YOUTUBE,
        provider_content_id="yt_teerathgarh_4k",
        content_type=ContentType.VIDEO,
        title="Sunrise at Teerathgarh Falls - Remastered",
        description="New description from creator on YouTube",
        source_url="https://youtube.com/watch?v=yt_teerathgarh_4k",
        thumbnail_url="https://img.youtube.com/vi/yt_teerathgarh_4k/hqdefault.jpg",
        published_at=datetime.now(timezone.utc),
        view_count=5000,
        like_count=250,
    )
    mock_provider.fetch_content.return_value = SyncResult(items=[mock_item_updated], next_cursor=None)

    with patch("app.modules.social.services.social_sync_engine.ProviderFactory.get_provider", return_value=mock_provider):
        res2 = engine.sync_account(account.id)
        assert res2["status"] == "SUCCESS"
        assert res2["items_synced"] == 1

    # Check deduplication: exactly one record exists
    all_matching = session.scalars(
        select(SocialContent).where(
            SocialContent.provider == SocialPlatform.YOUTUBE.value,
            SocialContent.provider_content_id == "yt_teerathgarh_4k",
        )
    ).all()
    assert len(all_matching) == 1

    updated_content = all_matching[0]
    # Metrics must be updated
    assert updated_content.views_count == 5000
    assert updated_content.likes_count == 250

    # Editorial fields MUST remain intact
    assert updated_content.place_id == place_id
    assert updated_content.place_slug == "teerathgarh-falls"
    assert updated_content.place_name == "Teerathgarh Falls"
    assert updated_content.cultural_sensitivity == CulturalSensitivityLevel.COMMUNITY_PROTECTED.value
    assert updated_content.district_id == "bastar"

