from __future__ import annotations

import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.domain.enums import (
    CreatorStatus,
    SocialAccountStatus,
    SocialPlatform,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.workflows.service import SocialWorkflowService


# -----------------------------------------------------------------------------
# 11.13 Creator Service Tests
# -----------------------------------------------------------------------------
def test_creator_service_crud_and_validation(session: Session) -> None:
    service = SocialWorkflowService(session=session)

    # 1. Onboard valid creator
    creator = service.creators.onboard_creator(
        display_name="Ravi Bastar",
        slug="ravi_bastar",
        bio="Tribal ethnographer",
        district_id="bastar",
        actor_id="admin-1",
    )
    assert creator.id is not None
    assert creator.handle == "ravi_bastar"
    assert creator.status == CreatorStatus.PENDING

    # 2. Duplicate slug rejection (409)
    with pytest.raises(AppError) as exc_info:
        service.creators.onboard_creator(
            display_name="Another Ravi",
            slug="ravi_bastar",
            district_id="bastar",
        )
    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.message.lower()

    # 3. Invalid district rejection
    with pytest.raises(AppError) as exc_info:
        service.creators.onboard_creator(
            display_name="Explorer",
            slug="unknown_district_explorer",
            district_id="non_existent_district_xyz",
        )
    assert exc_info.value.status_code == 422
    assert "unknown district" in exc_info.value.message.lower()

    # 4. Empty name rejection
    with pytest.raises(AppError) as exc_info:
        service.creators.onboard_creator(
            display_name="   ",
            slug="empty_name_creator",
            district_id="bastar",
        )
    assert exc_info.value.status_code == 422

    # 5. Activate creator
    activated = service.creators.activate_creator(creator.id, actor_id="admin-1")
    assert activated.status == CreatorStatus.ACTIVE

    # 6. Suspend creator
    suspended = service.creators.suspend_creator(creator.id, actor_id="admin-1", reason="TOS breach")
    assert suspended.status == CreatorStatus.SUSPENDED


# -----------------------------------------------------------------------------
# 11.14 & 11.15 Social Account Service & Duplicate Tests
# -----------------------------------------------------------------------------
def test_social_account_registration_and_duplicates(session: Session) -> None:
    service = SocialWorkflowService(session=session)

    creator = service.creators.onboard_creator(
        display_name="Ravi Bastar",
        slug="ravi_bastar_acc_test",
        district_id="bastar",
        auto_activate=True,
    )

    # 1. Register YouTube account from URL
    account = service.accounts.register_account(
        creator_id=creator.id,
        raw_input="https://youtube.com/@RaviBastar",
        actor_id="admin-1",
    )
    assert account.id is not None
    assert account.handle.lower() == "ravibastar"
    assert account.platform == SocialPlatform.YOUTUBE.value
    assert account.status == SocialAccountStatus.PENDING.value

    # 2. Duplicate registration with same URL -> 409
    with pytest.raises(AppError) as exc_info:
        service.accounts.register_account(
            creator_id=creator.id,
            raw_input="https://youtube.com/@RaviBastar",
        )
    assert exc_info.value.status_code == 409
    assert "already registered" in exc_info.value.message.lower()

    # 3. Duplicate registration with equivalent variant URL -> 409
    with pytest.raises(AppError) as exc_info:
        service.accounts.register_account(
            creator_id=creator.id,
            raw_input="https://www.youtube.com/@RaviBastar/",
        )
    assert exc_info.value.status_code == 409

    # 4. Pause and Reactivate Account
    account.status = SocialAccountStatus.ACTIVE.value
    session.flush()

    paused = service.accounts.pause_account(account.id, reason="Temporary hold")
    assert paused.status == SocialAccountStatus.PAUSED.value
    assert paused.sync_enabled is False

    reactivated = service.accounts.reactivate_account(account.id)
    assert reactivated.status == SocialAccountStatus.ACTIVE.value

    # 5. Disconnect Account
    disconnected = service.accounts.disconnect_account(account.id, reason="Creator unlinked")
    assert disconnected.status == SocialAccountStatus.DISCONNECTED.value
    assert disconnected.sync_enabled is False


# -----------------------------------------------------------------------------
# 11.16 Acceptance Service Tests (ACCEPTED != ACTIVE)
# -----------------------------------------------------------------------------
def test_acceptance_service_editorial_gates(session: Session) -> None:
    service = SocialWorkflowService(session=session)

    creator = service.creators.onboard_creator(
        display_name="Sirpur Scholar",
        slug="sirpur_scholar",
        district_id="mahasamund",
        auto_activate=True,
    )
    account = service.accounts.register_account(
        creator_id=creator.id,
        raw_input="https://instagram.com/sirpur_monastery",
    )

    # Cannot accept PENDING account directly (must be VERIFIED)
    with pytest.raises(AppError):
        service.acceptance.accept_account(account.id)

    # Manually transition to VERIFIED
    account.status = SocialAccountStatus.VERIFIED.value
    session.flush()

    # Editorial Acceptance
    accepted = service.acceptance.accept_account(
        account.id,
        editorial_note="Verified authentic heritage documentation",
        actor_id="editor-1",
    )
    assert accepted.status == SocialAccountStatus.ACCEPTED.value
    assert accepted.sync_enabled is False  # Invariant: ACCEPTED != ACTIVE

    # Operational Activation
    activated = service.acceptance.activate_account(
        accepted.id,
        enable_sync=True,
        actor_id="ops-admin-1",
    )
    assert activated.status == SocialAccountStatus.ACTIVE.value
    assert activated.sync_enabled is True
