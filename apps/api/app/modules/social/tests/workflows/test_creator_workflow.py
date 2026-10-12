from __future__ import annotations

import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.models import OutboxEvent
from app.modules.social.domain.enums import CreatorStatus
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.workflows.creator_workflow import CreatorWorkflow


def test_onboard_creator_success(session: Session) -> None:
    workflow = CreatorWorkflow(session)
    creator = workflow.onboard_creator(
        display_name="Bastar Explorer",
        slug="bastar_explorer",
        bio="Documenting local culture and tribal craft in Bastar",
        district_id="bastar",
        tourism_zone_id="bastar_tribal",
        languages=["hi", "en", "halbi"],
        categories=["culture", "crafts"],
        actor_id="admin-001",
    )

    assert creator.id is not None
    assert creator.display_name == "Bastar Explorer"
    assert creator.handle == "bastar_explorer"
    assert creator.district_id == "bastar"
    assert creator.status == CreatorStatus.PENDING

    # Check outbox event emission
    events = session.query(OutboxEvent).all()
    assert len(events) >= 1
    created_event = [e for e in events if e.event_type == "social.creator.created"][0]
    assert created_event.aggregate_id == creator.id
    assert created_event.payload["metadata"]["display_name"] == "Bastar Explorer"


def test_onboard_creator_invalid_geography(session: Session) -> None:
    workflow = CreatorWorkflow(session)
    with pytest.raises(AppError) as exc_info:
        workflow.onboard_creator(
            display_name="Unknown Explorer",
            slug="unknown_explorer",
            district_id="atlantis_city",
        )
    assert exc_info.value.code == "SOCIAL_INVALID_GEOGRAPHY_REFERENCE"


def test_onboard_creator_duplicate_slug(session: Session) -> None:
    workflow = CreatorWorkflow(session)
    workflow.onboard_creator(
        display_name="Dantewada Vistas",
        slug="dantewada_vistas",
        district_id="dantewada",
    )

    with pytest.raises(AppError) as exc_info:
        workflow.onboard_creator(
            display_name="Dantewada Duplicate",
            slug="dantewada_vistas",
            district_id="dantewada",
        )
    assert exc_info.value.code == "CREATOR_SLUG_EXISTS"


def test_activate_and_suspend_creator(session: Session) -> None:
    workflow = CreatorWorkflow(session)
    creator = workflow.onboard_creator(
        display_name="Sirpur Historian",
        slug="sirpur_historian",
        district_id="mahasamund",
    )
    assert creator.status == CreatorStatus.PENDING

    # Activate
    activated = workflow.activate_creator(creator.id, actor_id="admin-001")
    assert activated.status == CreatorStatus.ACTIVE

    # Suspend
    suspended = workflow.suspend_creator(creator.id, actor_id="admin-001", reason="Policy violation")
    assert suspended.status == CreatorStatus.SUSPENDED

    # Modifying suspended creator fails guard
    with pytest.raises(AppError) as exc_info:
        workflow.activate_creator(creator.id, actor_id="admin-001")
    assert exc_info.value.code == "SOCIAL_CREATOR_NOT_EDITABLE"
