from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.events.models import OutboxEvent
from app.modules.social.acceptance.policies import (
    AccountNotAcceptedError,
    AccountSyncDisabledError,
    assert_sync_allowed,
    can_sync,
)
from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.accounts.schemas import (
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountRegisterRequest,
)
from app.modules.social.accounts.service import DuplicateSocialAccountError, SocialAccountService
from app.modules.social.content.normalizer import SocialContentNormalizer
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.content.service import SocialContentService
from app.modules.social.creators.schemas import CreatorCreate
from app.modules.social.creators.service import CreatorService
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CreatorStatus,
    ModerationStatus,
    SocialAccountStatus,
    SocialContentType,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.engine import SocialEngine
from app.modules.social.feed.policy import FeedPolicy, is_feed_eligible
from app.modules.social.feed.query import FeedQuery
from app.modules.social.feed.service import SocialFeedService
from app.modules.social.models.creator import Creator
from app.modules.social.models.moderation import SocialModerationLog
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_media import SocialMedia
from app.modules.social.models.sync_log import SocialSyncRun
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.adapters.instagram_adapter import InstagramAdapter
from app.modules.social.providers.adapters.youtube_adapter import YouTubeAdapter
from app.modules.social.providers.base import ProviderContent
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.source.resolver import SourceResolver
from app.modules.social.source.validator import SourceValidator
from app.modules.social.sync.policies import is_content_type_allowed
from app.modules.social.sync.service import SocialSyncService


@pytest.fixture
def session():
    engine = create_engine("sqlite:///:memory:")
    OutboxEvent.__table__.create(bind=engine, checkfirst=True)
    Creator.__table__.create(bind=engine, checkfirst=True)
    SocialAccount.__table__.create(bind=engine, checkfirst=True)
    SocialAccountSyncState.__table__.create(bind=engine, checkfirst=True)
    SocialContent.__table__.create(bind=engine, checkfirst=True)
    SocialMedia.__table__.create(bind=engine, checkfirst=True)
    SocialSyncRun.__table__.create(bind=engine, checkfirst=True)
    SocialModerationLog.__table__.create(bind=engine, checkfirst=True)

    session_factory = sessionmaker(bind=engine)
    sess = session_factory()
    try:
        yield sess
    finally:
        sess.close()


# ---------------------------------------------------------------------------
# Section 1: Source Validation & Resolution
# ---------------------------------------------------------------------------
def test_source_validator_valid_and_invalid():
    # Valid YouTube URLs
    yt_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    validated_yt = SourceValidator.validate_platform_url(yt_url, SocialPlatform.YOUTUBE)
    assert validated_yt.value == yt_url

    short_yt = "https://youtu.be/dQw4w9WgXcQ"
    assert SourceValidator.validate_platform_url(short_yt, SocialPlatform.YOUTUBE).value == short_yt

    # Valid Instagram URLs
    ig_url = "https://www.instagram.com/p/Cxy12345"
    assert SourceValidator.validate_platform_url(ig_url, SocialPlatform.INSTAGRAM).value == ig_url

    # Cross-platform mismatch
    with pytest.raises(SourceUrlError):
        SourceValidator.validate_platform_url(yt_url, SocialPlatform.INSTAGRAM)

    with pytest.raises(SourceUrlError):
        SourceValidator.validate_platform_url(ig_url, SocialPlatform.YOUTUBE)

    # Invalid scheme
    with pytest.raises(SourceUrlError):
        SourceValidator.validate_url("javascript:alert(1)")


def test_source_resolver_fallbacks():
    resolver = SourceResolver()

    # Available item
    class MockContent:
        publication_status = "PUBLISHED"
        source_url = "https://www.youtube.com/watch?v=test123"

    assert resolver.resolve(MockContent()) == "https://www.youtube.com/watch?v=test123"
    assert resolver.is_available(MockContent()) is True

    # Unavailable due to status
    class UnavailableContent:
        publication_status = "SOURCE_UNAVAILABLE"
        source_url = "https://www.youtube.com/watch?v=test123"

    assert resolver.resolve(UnavailableContent()) == "SOURCE_UNAVAILABLE"
    assert resolver.is_available(UnavailableContent()) is False

    # Empty source url
    class EmptyContent:
        publication_status = "PUBLISHED"
        source_url = ""

    assert resolver.resolve(EmptyContent()) == "SOURCE_UNAVAILABLE"


# ---------------------------------------------------------------------------
# Section 2: Fail-Closed Acceptance Policies
# ---------------------------------------------------------------------------
def test_acceptance_policies_fail_closed(session: Session):
    creator = Creator(
        id=uuid.uuid4(),
        handle="bastar_vlogger",
        display_name="Bastar Vlogger",
        district_id="bastar",
        status="ACTIVE",
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="bastar_vlogger",
        status=SocialAccountStatus.PENDING.value,
        is_sync_enabled=True,
    )
    session.add(account)
    session.flush()

    # PENDING -> Not allowed to sync
    assert can_sync(account) is False
    with pytest.raises(AccountNotAcceptedError):
        assert_sync_allowed(account)

    # VERIFYING -> Not allowed
    account.status = SocialAccountStatus.VERIFYING.value
    assert can_sync(account) is False
    with pytest.raises(AccountNotAcceptedError):
        assert_sync_allowed(account)

    # VERIFIED -> Not allowed (must be accepted & activated by admin)
    account.status = SocialAccountStatus.VERIFIED.value
    assert can_sync(account) is False
    with pytest.raises(AccountNotAcceptedError):
        assert_sync_allowed(account)

    # ACCEPTED -> Not allowed until ACTIVE
    account.status = SocialAccountStatus.ACCEPTED.value
    assert can_sync(account) is False
    with pytest.raises(AccountNotAcceptedError):
        assert_sync_allowed(account)

    # ACTIVE but sync disabled -> raises AccountSyncDisabledError
    account.status = SocialAccountStatus.ACTIVE.value
    account.is_sync_enabled = False
    assert can_sync(account) is False
    with pytest.raises(AccountSyncDisabledError):
        assert_sync_allowed(account)

    # ACTIVE + sync_enabled=True -> Allowed!
    account.is_sync_enabled = True
    assert can_sync(account) is True
    assert_sync_allowed(account)  # Does not raise


# ---------------------------------------------------------------------------
# Section 3: Provider Adapters & Capabilities
# ---------------------------------------------------------------------------
def test_provider_adapters():
    yt = YouTubeAdapter()
    caps_yt = yt.capabilities()
    assert caps_yt.supports_videos is True
    assert caps_yt.supports_shorts is True
    assert caps_yt.supports_reels is False

    profile_yt = yt.verify_account("@bastar_arts")
    assert profile_yt.is_valid is True
    assert profile_yt.handle == "bastar_arts"

    content_yt = yt.fetch_content("bastar_arts", limit=5)
    assert len(content_yt.items) > 0
    assert all("youtube.com" in item.source_url or "youtu.be" in item.source_url for item in content_yt.items)

    ig = InstagramAdapter()
    caps_ig = ig.capabilities()
    assert caps_ig.supports_reels is True
    assert caps_ig.supports_posts is True
    assert caps_ig.supports_shorts is False


# ---------------------------------------------------------------------------
# Section 4: Content Normalizer & Context Resolution
# ---------------------------------------------------------------------------
def test_content_normalizer():
    creator_id = uuid.uuid4()
    account_id = uuid.uuid4()

    item = ProviderContent(
        external_id="vid_bastar_waterfall_01",
        content_type=SocialContentType.VIDEO,
        title="Magnificent Chitrakote Waterfall during Monsoon in Bastar",
        description="Experience the Niagara of India! #Chitrakote #BastarTourism #Waterfall",
        source_url="https://www.youtube.com/watch?v=vid_bastar_waterfall_01",
        thumbnail_url="https://img.youtube.com/vi/vid_bastar_waterfall_01/hqdefault.jpg",
        published_at=datetime.now(timezone.utc),
        duration_seconds=320,
        view_count=5000,
        like_count=450,
        raw_metadata={"tags": ["waterfalls", "nature"]},
    )

    normalized = SocialContentNormalizer.normalize_provider_content(
        item=item,
        platform=SocialPlatform.YOUTUBE,
        creator_id=creator_id,
        social_account_id=account_id,
        creator_district_id="bastar",
    )

    assert normalized.district_id == "bastar"
    assert "waterfalls" in normalized.tourism_tags
    assert normalized.original_platform_action_label == "Watch on YouTube"
    assert normalized.provider == SocialPlatform.YOUTUBE.value
    assert normalized.provider_content_id == "vid_bastar_waterfall_01"
    assert normalized.slug.startswith("youtube-vidbastarwaterfall01")


# ---------------------------------------------------------------------------
# Section 5: End-to-End Social Engine Lifecycle
# ---------------------------------------------------------------------------
def test_social_engine_lifecycle(session: Session):
    engine = SocialEngine(session)

    # 1. Admin creates creator
    creator_in = CreatorCreate(
        handle="dholkal_explorer",
        display_name="Dholkal Explorer",
        district_id="dantewada",
        bio="Documenting high-altitude Bastar treks",
        languages=["hi", "en"],
        categories=["Adventure", "Heritage"],
    )
    creator = engine.creators.create_creator(creator_in)
    assert creator.handle == "dholkal_explorer"
    assert creator.status == "PENDING"

    # Duplicate handle test
    with pytest.raises(Exception):
        engine.creators.create_creator(creator_in)

    # Verify and activate creator
    engine.creators.verify_creator(creator.id, is_verified=True)
    engine.creators.activate_creator(creator.id)

    # 2. Register social account
    acc_in = SocialAccountRegisterRequest(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE,
        handle="dholkal_explorer",
        profile_url="https://www.youtube.com/@dholkal_explorer",
        content_types_allowed=["VIDEO", "SHORT"],
    )
    account = engine.accounts.register_social_account(creator.id, acc_in, auto_verify=True)
    assert account.platform == SocialPlatform.YOUTUBE.value
    assert account.handle == "dholkal_explorer"
    # Auto-verified transitions to VERIFIED
    assert account.status == SocialAccountStatus.VERIFIED.value

    # Duplicate account guard test
    with pytest.raises(DuplicateSocialAccountError):
        engine.accounts.register_social_account(creator.id, acc_in, auto_verify=False)

    # Sync before acceptance must be skipped (fail-closed!)
    skip_res = engine.sync.sync_account(account.id)
    assert skip_res.status == "SKIPPED"

    # 3. Admin accepts social account
    accept_payload = SocialAccountAcceptPayload(
        approved_content_types=["VIDEO", "SHORT"],
        priority=80,
    )
    account = engine.accounts.accept_social_account(account.id, accept_payload)
    assert account.status == SocialAccountStatus.ACTIVE.value
    assert account.sync_enabled is True

    # 4. Trigger Sync
    sync_res = engine.sync.sync_account(account.id)
    assert sync_res.status == "SUCCEEDED"
    assert sync_res.created > 0
    assert sync_res.failed == 0

    first_created_count = sync_res.created

    # 5. Run sync again: Deduplication ensures no duplicate rows are inserted
    sync_res_2 = engine.sync.sync_account(account.id)
    assert sync_res_2.status == "SUCCEEDED"
    assert sync_res_2.created == 0  # No new rows created!
    assert sync_res_2.updated == first_created_count  # All updated in place!

    # 6. Retrieve Feed
    feed = engine.feed.get_feed(FeedQuery(district_id="dantewada", limit=10))
    # Even if default mock district was bastar, query without filter returns items
    global_feed = engine.feed.get_feed(FeedQuery(limit=10))
    assert len(global_feed) > 0

    # 7. Check source URL deep link resolution
    first_item = global_feed[0]
    source_resolved = engine.feed.resolve_source_url(first_item.id)
    assert source_resolved.startswith("https://")
    assert "youtube.com" in source_resolved


# ---------------------------------------------------------------------------
# Section 6: Feed Eligibility & Moderation Flow
# ---------------------------------------------------------------------------
def test_feed_eligibility_and_moderation(session: Session):
    engine = SocialEngine(session)

    creator = Creator(
        id=uuid.uuid4(),
        handle="sirpur_heritage",
        display_name="Sirpur Heritage",
        district_id="mahasamund",
        status="ACTIVE",
    )
    session.add(creator)
    session.flush()

    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        content_type=ContentType.POST.value,
        title="Ancient Laxman Temple of Sirpur",
        caption="7th-century brick temple architecture",
        slug="sirpur-laxman-temple-brick",
        district_id="mahasamund",
        source_url="https://www.youtube.com/watch?v=sirpur123",
        publication_status=ContentStatus.DRAFT.value,
        moderation_status=ModerationStatus.PENDING.value,
        visibility=ContentVisibility.PUBLIC.value,
    )
    session.add(content)
    session.flush()

    # DRAFT content is not eligible for feed
    assert is_feed_eligible(content) is False

    # Moderator approves content
    moderator_id = uuid.uuid4()
    engine.moderation.approve(content.id, moderator_id=moderator_id, reason="Excellent cultural documentation")

    # Reload from session
    session.refresh(content)
    assert content.publication_status == ContentStatus.PUBLISHED.value
    assert content.moderation_status == ModerationStatus.APPROVED.value
    assert is_feed_eligible(content) is True

    # Hide content
    engine.moderation.hide(content.id, reason="Copyright claim")
    session.refresh(content)
    assert is_feed_eligible(content) is False

    # Restore content
    engine.moderation.restore(content.id)
    session.refresh(content)
    assert is_feed_eligible(content) is True


def test_source_resolver_private_or_deleted():
    resolver = SourceResolver()

    class PrivateContent:
        publication_status = "SOURCE_PRIVATE"
        source_url = "https://www.youtube.com/watch?v=priv123"

    class DeletedContent:
        publication_status = "SOURCE_DELETED"
        source_url = "https://www.youtube.com/watch?v=del123"

    assert resolver.resolve(PrivateContent()) == "SOURCE_UNAVAILABLE"
    assert resolver.resolve(DeletedContent()) == "SOURCE_UNAVAILABLE"


def test_feed_policy_expired_without_evergreen():
    past_time = datetime(2020, 1, 1, tzinfo=timezone.utc)

    # Expired and not evergreen -> Ineligible
    expired_item = SocialContent(
        publication_status=ContentStatus.PUBLISHED.value,
        moderation_status=ModerationStatus.APPROVED.value,
        visibility=ContentVisibility.PUBLIC.value,
        expires_at=past_time,
        is_evergreen=False,
    )
    assert is_feed_eligible(expired_item) is False

    # Expired but evergreen -> Eligible
    evergreen_item = SocialContent(
        publication_status=ContentStatus.PUBLISHED.value,
        moderation_status=ModerationStatus.APPROVED.value,
        visibility=ContentVisibility.PUBLIC.value,
        expires_at=past_time,
        is_evergreen=True,
    )
    assert is_feed_eligible(evergreen_item) is True


def test_sync_engine_error_tracking_and_quarantine(session: Session):
    engine = SocialEngine(session)

    creator = Creator(
        id=uuid.uuid4(),
        handle="corrupted_creator",
        display_name="Corrupted Creator",
        district_id="bastar",
        status="ACTIVE",
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="corrupted_handle",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
        consecutive_failures=0,
    )
    session.add(account)
    session.flush()

    # Monkeypatch provider to raise an exception
    class FaultyProvider:
        platform = SocialPlatform.YOUTUBE
        def fetch_content(self, *args, **kwargs):
            raise ConnectionResetError("Provider network timeout")

    faulty_registry = ProviderRegistry()
    faulty_registry.register(FaultyProvider())
    engine.sync.provider_registry = faulty_registry

    # Failure 1
    res1 = engine.sync.sync_account(account.id)
    assert res1.status == "FAILED"
    assert account.consecutive_failures == 1
    assert account.sync_health == "HEALTHY"

    # Failure 2
    engine.sync.sync_account(account.id)
    assert account.consecutive_failures == 2

    # Failure 3 -> ERROR
    engine.sync.sync_account(account.id)
    assert account.consecutive_failures == 3
    assert account.sync_health == "ERROR"

    # Failure 4
    engine.sync.sync_account(account.id)
    assert account.consecutive_failures == 4

    # Failure 5 -> PAUSED and QUARANTINED (sync_enabled becomes False)
    engine.sync.sync_account(account.id)
    assert account.consecutive_failures == 5
    assert account.sync_health == "PAUSED"
    assert account.sync_enabled is False

    # Next attempt without force will skip because sync_enabled is False
    skip_res = engine.sync.sync_account(account.id)
    assert skip_res.status == "SKIPPED"
