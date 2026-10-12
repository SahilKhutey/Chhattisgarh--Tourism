from __future__ import annotations

import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.models import OutboxEvent
from app.modules.social.domain.enums import ContentType, CreatorStatus, SocialAccountStatus, SocialContentStatus, SocialPlatform, SocialVisibility
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.workflows.tourism_context_workflow import TourismContextWorkflow


@pytest.fixture
def base_content(session: Session) -> SocialContent:
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Tribal Explorer",
        handle="tribal_explorer",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="tribalexplorer",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
    )
    session.add(account)
    session.flush()

    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=account.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_video_001",
        content_type=ContentType.VIDEO.value,
        title="Waterfalls of Bastar",
        caption="Exploring the roaring waters during monsoon",
        slug="waterfalls-of-bastar",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_video_001",
        status=SocialContentStatus.PUBLISHED.value,
        visibility=SocialVisibility.PUBLIC.value,
    )
    session.add(content)
    session.flush()
    return content


def test_assign_tourism_context_success(session: Session, base_content: SocialContent) -> None:
    workflow = TourismContextWorkflow(session)
    updated = workflow.assign_tourism_context(
        base_content.id,
        district_id="bastar",
        place_slug="chitrakote-falls",
        place_name="Chitrakote Falls",
        tourism_zone_id="bastar_tribal",
        festival_name="Bastar Lokotsav",
        actor_id="admin-001",
    )

    assert updated.district_id == "bastar"
    assert updated.place_slug == "chitrakote-falls"
    assert updated.place_name == "Chitrakote Falls"
    assert updated.festival_name == "Bastar Lokotsav"
    assert updated.place_id is not None

    # Check outbox event
    events = session.query(OutboxEvent).all()
    tourism_events = [e for e in events if e.event_type == "social.tourism.context_assigned"]
    assert len(tourism_events) == 1
    assert tourism_events[0].payload["metadata"]["place_slug"] == "chitrakote-falls"


def test_assign_tourism_context_cross_district_mismatch(session: Session, base_content: SocialContent) -> None:
    workflow = TourismContextWorkflow(session)
    # Chitrakote Falls belongs to Bastar, NOT Raipur!
    with pytest.raises(AppError) as exc_info:
        workflow.assign_tourism_context(
            base_content.id,
            district_id="raipur",
            place_slug="chitrakote-falls",
        )
    assert exc_info.value.code == "SOCIAL_INVALID_GEOGRAPHY_REFERENCE"


def test_assign_tourism_context_unknown_district(session: Session, base_content: SocialContent) -> None:
    workflow = TourismContextWorkflow(session)
    with pytest.raises(AppError) as exc_info:
        workflow.assign_tourism_context(
            base_content.id,
            district_id="nonexistent_district",
            place_slug="unknown_place",
        )
    assert exc_info.value.code == "SOCIAL_INVALID_GEOGRAPHY_REFERENCE"
