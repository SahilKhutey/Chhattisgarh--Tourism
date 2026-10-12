from __future__ import annotations

import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.models import OutboxEvent
from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus, SocialPlatform
from app.modules.social.models.creator import Creator
from app.modules.social.policies.account_policy import SocialAccountPolicy
from app.modules.social.workflows.account_workflow import SocialAccountWorkflow


@pytest.fixture
def test_creator(session: Session) -> Creator:
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Raipur Vlogger",
        handle="raipur_vlogger",
        district_id="raipur",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)
    session.flush()
    return creator


def test_register_account_handle_and_url(session: Session, test_creator: Creator) -> None:
    workflow = SocialAccountWorkflow(session)

    # 1. Register with raw handle and platform hint
    account1 = workflow.register_account(
        creator_id=test_creator.id,
        raw_input="@raipur_explorer",
        platform_hint="INSTAGRAM",
        actor_id="admin-001",
    )
    assert account1.id is not None
    assert account1.platform == SocialPlatform.INSTAGRAM
    assert account1.handle == "raipur_explorer"
    assert account1.status == SocialAccountStatus.PENDING

    # 2. Register with YouTube channel URL
    account2 = workflow.register_account(
        creator_id=test_creator.id,
        raw_input="https://www.youtube.com/@chhattisgarh_travel",
        actor_id="admin-001",
    )
    assert account2.platform == SocialPlatform.YOUTUBE
    assert account2.handle == "chhattisgarh_travel"
    assert account2.status == SocialAccountStatus.PENDING


def test_register_account_duplicate_rejection(session: Session, test_creator: Creator) -> None:
    workflow = SocialAccountWorkflow(session)
    workflow.register_account(
        creator_id=test_creator.id,
        raw_input="unique_handle",
        platform_hint="INSTAGRAM",
    )

    with pytest.raises(AppError) as exc_info:
        workflow.register_account(
            creator_id=test_creator.id,
            raw_input="unique_handle",
            platform_hint="INSTAGRAM",
        )
    assert exc_info.value.code == "SOCIAL_ACCOUNT_ALREADY_EXISTS"


def test_account_lifecycle_pause_reactivate_disconnect(session: Session, test_creator: Creator) -> None:
    workflow = SocialAccountWorkflow(session)
    account = workflow.register_account(
        creator_id=test_creator.id,
        raw_input="trail_guide",
        platform_hint="INSTAGRAM",
    )

    # Move to ACTIVE
    account.status = SocialAccountStatus.ACTIVE
    account.sync_enabled = True
    session.flush()

    # Pause
    paused = workflow.pause_account(account.id, actor_id="admin-001", reason="Maintenance")
    assert paused.status == SocialAccountStatus.PAUSED
    assert paused.sync_enabled is False

    # Reactivate
    reactivated = workflow.reactivate_account(account.id, actor_id="admin-001")
    assert reactivated.status == SocialAccountStatus.ACTIVE
    assert reactivated.sync_enabled is True

    # Disconnect
    disconnected = workflow.disconnect_account(account.id, actor_id="admin-001", reason="Creator requested removal")
    assert disconnected.status == SocialAccountStatus.DISCONNECTED
    assert disconnected.sync_enabled is False


def test_invariant_accepted_is_not_active(session: Session, test_creator: Creator) -> None:
    workflow = SocialAccountWorkflow(session)
    account = workflow.register_account(
        creator_id=test_creator.id,
        raw_input="tribal_arts",
        platform_hint="INSTAGRAM",
    )

    account.status = SocialAccountStatus.ACCEPTED
    session.flush()

    # Invariant assertion
    can_activate = SocialAccountPolicy.can_activate(account)
    assert can_activate is True
    # ACCEPTED status alone does not satisfy ACTIVE
    assert account.status != SocialAccountStatus.ACTIVE
