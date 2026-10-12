from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CreatorStatus,
    CulturalSensitivityLevel,
    FeedType,
    LicenseType,
    ModerationDecision,
    ModerationStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.domain.state_machines import (
    ContentStateMachine,
    InvalidStateTransitionError,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.moderation import SocialModerationLog
from app.modules.social.services.feed_service import FeedService
from app.modules.social.services.moderation_service import ModerationService
from app.modules.social.services.social_content_service import SocialContentService
from app.modules.social.workflows.guards import (
    InvalidGeographyReferenceError,
    ContentNotPublishableError,
    assert_content_publishable,
    assert_geography_valid,
)
from app.modules.social.workflows.service import SocialWorkflowService
from app.modules.social.tests.fixtures import setup_social_test_environment


def test_content_canonical_lifecycle_transitions() -> None:
    """11.26: Test canonical content state transitions."""
    # DISCOVERED/DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PUBLISHED
    current = ContentStatus.DRAFT
    current = ContentStateMachine.transition(current, ContentStatus.SUBMITTED)
    assert current == ContentStatus.SUBMITTED

    current = ContentStateMachine.transition(current, ContentStatus.UNDER_REVIEW)
    assert current == ContentStatus.UNDER_REVIEW

    current = ContentStateMachine.transition(current, ContentStatus.APPROVED)
    assert current == ContentStatus.APPROVED

    current = ContentStateMachine.transition(current, ContentStatus.PUBLISHED)
    assert current == ContentStatus.PUBLISHED

    # Ephemeral expiration transition
    current = ContentStateMachine.transition(current, ContentStatus.EXPIRED)
    assert current == ContentStatus.EXPIRED


def test_invalid_content_lifecycle_transitions_rejected() -> None:
    """11.27: Test invalid lifecycle transitions are rejected by state machine."""
    # DRAFT cannot jump directly to PUBLISHED without review/approval
    with pytest.raises(InvalidStateTransitionError):
        ContentStateMachine.transition(ContentStatus.DRAFT, ContentStatus.PUBLISHED)

    # SUBMITTED cannot jump directly to PUBLISHED
    with pytest.raises(InvalidStateTransitionError):
        ContentStateMachine.transition(ContentStatus.SUBMITTED, ContentStatus.PUBLISHED)

    # REJECTED cannot transition to PUBLISHED
    with pytest.raises(InvalidStateTransitionError):
        ContentStateMachine.transition(ContentStatus.REJECTED, ContentStatus.PUBLISHED)


def test_moderation_actions_and_audit_trail(session: Session) -> None:
    """11.28 & 11.29: Test moderation review, status updates, and audit logging."""
    env = setup_social_test_environment(session)
    mod_service = ModerationService(db=session)

    content = env.content_pending_review
    assert content.moderation_status == ModerationStatus.PENDING.value

    moderator_id = uuid.uuid4()

    # Reject item with explicit reason
    from app.modules.social.schemas.moderation_schemas import ModerationReviewRequest
    review_req = ModerationReviewRequest(
        decision=ModerationDecision.REJECT,
        reason="Does not meet cultural authenticity standard for Bastar",
        cultural_notes="Misidentified ritual dance as casual dance",
    )

    reviewed = mod_service.review_content(
        content_id=content.id,
        moderator_id=moderator_id,
        review=review_req,
    )

    assert reviewed.moderation_status == ModerationStatus.REJECTED.value
    assert reviewed.publication_status == ContentStatus.REJECTED.value

    # Verify audit log entry
    logs = session.query(SocialModerationLog).filter_by(content_id=content.id).all()
    assert len(logs) == 1
    assert logs[0].moderator_id == moderator_id
    assert logs[0].decision == ModerationDecision.REJECT.value
    assert "authenticity" in logs[0].reason


def test_cultural_consent_guard_in_moderation(session: Session) -> None:
    """11.28 & 9.28: Test clan/cultural consent enforcement for restricted content."""
    env = setup_social_test_environment(session)
    workflow = SocialWorkflowService(session=session)

    # Content with sacred ritual sensitivity without consent must fail moderation
    sacred_content = SocialContent(
        id=uuid.uuid4(),
        creator_id=env.creator_a.id,
        social_account_id=env.creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_sacred_test_01",
        content_type=ContentType.VIDEO.value,
        title="Sacred Ritual of Bastar Dussehra",
        caption="Sacred tribal ceremony",
        slug="sacred-ritual-bastar-01",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_sacred_test_01",
        cultural_sensitivity=CulturalSensitivityLevel.SACRED_RITUAL.value,
        has_sacred_consent=False,  # NO CONSENT
        publication_status=SocialContentStatus.UNDER_REVIEW.value,
    )
    session.add(sacred_content)
    session.flush()

    with pytest.raises(AppError) as exc_info:
        workflow.moderation.approve_content(sacred_content.id, actor_id="admin_mod")
    assert exc_info.value.status_code == 422
    assert "CULTURAL_CONSENT_VIOLATION" in exc_info.value.code

    # Once sacred consent is granted, approval succeeds
    sacred_content.has_sacred_consent = True
    sacred_content.community_attribution = "Bastar Mariya Elder Council"
    session.flush()

    approved = workflow.moderation.approve_content(sacred_content.id, actor_id="admin_mod")
    assert approved.status == SocialContentStatus.APPROVED


def test_publication_eligibility_gate_matrix(session: Session) -> None:
    """11.30: Test publication eligibility gate matrix."""
    env = setup_social_test_environment(session)

    # 1. Non-approved content cannot be published
    with pytest.raises(ContentNotPublishableError):
        assert_content_publishable(env.content_pending_review, env.creator_a, env.creator_a_yt)

    # 2. Suspended creator cannot be published
    suspended_creator = Creator(
        id=uuid.uuid4(),
        display_name="Suspended Creator",
        handle="suspended_one",
        district_id="bastar",
        status=CreatorStatus.SUSPENDED,
    )
    approved_content = SocialContent(
        id=uuid.uuid4(),
        creator_id=suspended_creator.id,
        social_account_id=env.creator_a_yt.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_test_susp",
        content_type=ContentType.VIDEO.value,
        title="Bastar Trail",
        slug="bastar-trail-susp",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_test_susp",
        publication_status=SocialContentStatus.APPROVED.value,
    )
    with pytest.raises(ContentNotPublishableError):
        assert_content_publishable(approved_content, suspended_creator, env.creator_a_yt)

    # 3. Inactive/rejected account cannot be published
    with pytest.raises(ContentNotPublishableError):
        assert_content_publishable(approved_content, env.creator_a, env.creator_c_yt)

    # 4. Source unavailable or deleted cannot be published
    with pytest.raises(ContentNotPublishableError):
        assert_content_publishable(env.content_deleted_source, env.creator_a, env.creator_a_yt)


def test_feed_eligibility_gate_and_filtering(session: Session) -> None:
    """11.31 & 11.32: Comprehensive Feed eligibility query and filters."""
    env = setup_social_test_environment(session)
    feed_service = FeedService(db=session)

    # Default Home feed: should contain published public content
    cards = feed_service.get_feed(feed_type=FeedType.HOME, limit=20)
    card_ids = [c.id for c in cards]

    # Published items should be present
    assert env.content_video.id in card_ids
    assert env.content_reel.id in card_ids
    assert env.content_short.id in card_ids

    # Excluded items MUST NOT be present
    assert env.content_hidden.id not in card_ids  # Hidden visibility
    assert env.content_pending_review.id not in card_ids  # Not published yet
    assert env.content_deleted_source.id not in card_ids  # Deleted on YouTube

    # District filter
    bastar_cards = feed_service.get_feed(district_id="bastar", limit=20)
    for c in bastar_cards:
        assert c.district_id.lower() == "bastar"

    # Content type filter
    video_cards = feed_service.get_feed(content_type=ContentType.VIDEO, limit=20)
    for c in video_cards:
        assert c.content_type == ContentType.VIDEO.value

    # Place filter
    place_cards = feed_service.get_feed(place_slug="chitrakote-falls", limit=20)
    for c in place_cards:
        assert c.place_slug == "chitrakote-falls"


def test_cursor_pagination_stability(session: Session) -> None:
    """11.33: Test feed pagination determinism (no duplicates across pages)."""
    env = setup_social_test_environment(session)
    feed_service = FeedService(db=session)

    # Insert 6 distinct published posts with staggered timestamps
    now = datetime.now(timezone.utc)
    for i in range(6):
        item = SocialContent(
            id=uuid.uuid4(),
            creator_id=env.creator_a.id,
            social_account_id=env.creator_a_yt.id,
            provider=SocialPlatform.YOUTUBE.value,
            provider_content_id=f"yt_page_test_{i}",
            content_type=ContentType.VIDEO.value,
            title=f"Page Test Item {i}",
            slug=f"page-test-item-{i}",
            district_id="bastar",
            source_url=f"https://youtube.com/watch?v=yt_page_test_{i}",
            publication_status=ContentStatus.PUBLISHED.value,
            visibility=ContentVisibility.PUBLIC.value,
            published_at=now - timedelta(hours=i),
            likes_count=100 - i,  # decreasing likes
        )
        session.add(item)
    session.flush()

    # Query Page 1 (limit 3, offset 0)
    page_1 = feed_service.get_feed(limit=3, offset=0, enable_diversity=False)
    # Query Page 2 (limit 3, offset 3)
    page_2 = feed_service.get_feed(limit=3, offset=3, enable_diversity=False)

    p1_ids = {c.id for c in page_1}
    p2_ids = {c.id for c in page_2}

    # Verify no overlaps between pages
    assert len(p1_ids.intersection(p2_ids)) == 0
    assert len(page_1) == 3
    assert len(page_2) == 3


def test_anti_monopoly_diversity_policy(session: Session) -> None:
    """11.34: Test anti-monopoly interleaving to prevent single creator dominance."""
    feed_service = FeedService(db=session)

    creator_1 = uuid.uuid4()
    creator_2 = uuid.uuid4()
    creator_3 = uuid.uuid4()

    items = []
    # 5 items from creator 1
    for i in range(5):
        items.append(
            SocialContent(
                id=uuid.uuid4(),
                creator_id=creator_1,
                district_id="bastar",
                title=f"Creator 1 Item {i}",
                slug=f"c1-item-{i}",
            )
        )
    # 2 items from creator 2
    for i in range(2):
        items.append(
            SocialContent(
                id=uuid.uuid4(),
                creator_id=creator_2,
                district_id="surguja",
                title=f"Creator 2 Item {i}",
                slug=f"c2-item-{i}",
            )
        )
    # 1 item from creator 3
    items.append(
        SocialContent(
            id=uuid.uuid4(),
            creator_id=creator_3,
            district_id="dantewada",
            title="Creator 3 Item 0",
            slug="c3-item-0",
        )
    )

    # Apply anti-monopoly diversity with max 2 per creator
    diverse = feed_service._apply_anti_monopoly_diversity(items, max_per_creator=2)

    # First slots must not exceed 2 consecutive/dominant items of creator_1
    top_5_creators = [it.creator_id for it in diverse[:5]]
    assert top_5_creators.count(creator_1) <= 2
    # Ensure creator 2 and creator 3 were promoted into diverse slots
    assert creator_2 in top_5_creators
    assert creator_3 in top_5_creators


def test_geography_context_validation_guard() -> None:
    """11.35: Test tourism entity graph geographic validation."""
    # Valid matching district and place
    assert_geography_valid("bastar", "chitrakote-falls")
    assert_geography_valid("bastar", "teerathgarh-falls")
    assert_geography_valid("surguja", "mainpat")

    # Mismatched place and district must raise InvalidGeographyReferenceError
    with pytest.raises(InvalidGeographyReferenceError) as exc_mismatch:
        assert_geography_valid("raipur", "chitrakote-falls")
    assert "belongs to district 'bastar', not 'raipur'" in str(exc_mismatch.value)

    # Unknown district not in Chhattisgarh's 33 districts must raise error
    with pytest.raises(InvalidGeographyReferenceError) as exc_unknown:
        assert_geography_valid("delhi", None)
    assert "Unknown district 'delhi'" in str(exc_unknown.value)
