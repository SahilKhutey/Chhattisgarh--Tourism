import pytest
import uuid
from sqlalchemy.orm import Session

from app.modules.social.acceptance.policies import SocialAcceptancePolicy
from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.acceptance.workflow import (
    ConcurrencyStateConflictError,
    SocialAcceptanceWorkflow,
)
from app.modules.social.domain.enums import SocialAccountStatus, SocialPlatform
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.repositories.social_account_repository import SocialAccountRepository
from app.modules.social.creators.repository import CreatorRepository


def test_acceptance_workflow_transitions():
    wf = SocialAcceptanceWorkflow()

    # Valid transitions
    assert wf.transition(SocialAccountStatus.PENDING, SocialAccountStatus.VERIFYING) == SocialAccountStatus.VERIFYING
    assert wf.transition(SocialAccountStatus.VERIFYING, SocialAccountStatus.VERIFIED) == SocialAccountStatus.VERIFIED
    assert wf.transition(SocialAccountStatus.VERIFIED, SocialAccountStatus.PENDING_ACCEPTANCE) == SocialAccountStatus.PENDING_ACCEPTANCE
    assert wf.transition(SocialAccountStatus.PENDING_ACCEPTANCE, SocialAccountStatus.ACCEPTED) == SocialAccountStatus.ACCEPTED
    assert wf.transition(SocialAccountStatus.ACCEPTED, SocialAccountStatus.ACTIVE) == SocialAccountStatus.ACTIVE
    assert wf.transition(SocialAccountStatus.ACTIVE, SocialAccountStatus.PAUSED) == SocialAccountStatus.PAUSED
    assert wf.transition(SocialAccountStatus.PAUSED, SocialAccountStatus.ACTIVE) == SocialAccountStatus.ACTIVE

    # Invalid transition: PENDING directly to ACCEPTED must fail
    with pytest.raises(ValueError, match="Illegal state transition"):
        wf.transition(SocialAccountStatus.PENDING, SocialAccountStatus.ACCEPTED)

    # Invalid transition: PENDING directly to PENDING_ACCEPTANCE must fail (must be VERIFIED first!)
    with pytest.raises(ValueError, match="Illegal state transition"):
        wf.transition(SocialAccountStatus.PENDING, SocialAccountStatus.PENDING_ACCEPTANCE)

    # Invalid transition: REJECTED directly to ACTIVE must fail
    with pytest.raises(ValueError, match="Illegal state transition"):
        wf.transition(SocialAccountStatus.REJECTED, SocialAccountStatus.ACTIVE)


def test_concurrency_state_conflict():
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="bastar_vids",
        profile_url="https://youtube.com/@bastar_vids",
        status=SocialAccountStatus.PENDING_ACCEPTANCE.value,
    )

    # Expected state matches
    SocialAcceptanceWorkflow.verify_expected_state(account, SocialAccountStatus.PENDING_ACCEPTANCE)

    # Expected state conflict raises HTTP 409 error
    with pytest.raises(ConcurrencyStateConflictError) as exc_info:
        SocialAcceptanceWorkflow.verify_expected_state(account, SocialAccountStatus.VERIFIED)
    assert exc_info.value.status_code == 409


def test_acceptance_policy_rules():
    policy = SocialAcceptancePolicy()

    # can_submit: only verified accounts can be submitted for editorial acceptance
    assert policy.can_submit(SocialAccountStatus.VERIFIED) is True
    assert policy.can_submit(SocialAccountStatus.PENDING) is False
    assert policy.can_submit(SocialAccountStatus.ACTIVE) is False

    # can_accept: verified or pending_acceptance accounts can be accepted
    assert policy.can_accept(SocialAccountStatus.VERIFIED) is True
    assert policy.can_accept(SocialAccountStatus.PENDING_ACCEPTANCE) is True
    assert policy.can_accept(SocialAccountStatus.PENDING) is False

    # can_activate: only accepted accounts with sync_enabled can be activated
    assert policy.can_activate(SocialAccountStatus.ACCEPTED, sync_enabled=True) is True
    assert policy.can_activate(SocialAccountStatus.ACCEPTED, sync_enabled=False) is False
    assert policy.can_activate(SocialAccountStatus.PENDING, sync_enabled=True) is False


def test_acceptance_service_accept_lifecycle(session: Session):
    repo = SocialAccountRepository(session)
    creator_repo = CreatorRepository(session)

    creator = Creator(
        handle="sirpur_traveler",
        display_name="Sirpur Traveler",
        district_id="mahasamund",
    )
    creator_repo.create(creator)

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="sirpur_traveler",
        profile_url="https://youtube.com/@sirpur_traveler",
        status=SocialAccountStatus.VERIFIED.value,
    )
    saved_acc = repo.create(account)
    session.commit()

    service = SocialAcceptanceService(session_or_repo=repo)

    # Admin accepts verified account
    accepted = service.accept(
        saved_acc.id,
        approved_content_types=["VIDEO", "SHORT"],
        priority=90,
        reason="High quality Sirpur Buddhist monuments content",
    )

    assert accepted.status == SocialAccountStatus.ACTIVE.value
    assert accepted.sync_enabled is True
    assert accepted.priority == 90
    assert accepted.content_types_allowed == ["VIDEO", "SHORT"]

    # Idempotent call should succeed without error
    same_accepted = service.accept(saved_acc.id)
    assert same_accepted.id == accepted.id


def test_acceptance_service_rejection_requires_reason(session: Session):
    repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.INSTAGRAM.value,
        handle="spam_account",
        profile_url="https://instagram.com/spam_account",
        status=SocialAccountStatus.PENDING_ACCEPTANCE.value,
    )
    saved_acc = repo.create(account)
    session.commit()

    service = SocialAcceptanceService(session_or_repo=repo)

    # Empty reason must fail
    with pytest.raises(ValueError, match="rejection reason is required"):
        service.reject(saved_acc.id, reason="   ")

    # Valid rejection
    rejected = service.reject(
        saved_acc.id,
        reason="Commercial promotional spam unrelated to Chhattisgarh culture",
        reason_code="OFF_TOPIC",
    )
    assert rejected.status == SocialAccountStatus.REJECTED.value
    assert rejected.sync_enabled is False
    assert "Commercial promotional spam" in rejected.last_error


def test_acceptance_service_request_changes(session: Session):
    repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="chhattisgarh_caves",
        profile_url="https://youtube.com/@chhattisgarh_caves",
        status=SocialAccountStatus.PENDING_ACCEPTANCE.value,
    )
    saved_acc = repo.create(account)
    session.commit()

    service = SocialAcceptanceService(session_or_repo=repo)

    # Request changes
    updated = service.request_changes(
        saved_acc.id,
        reason="Please provide official tourism accreditation details.",
        requested_fields=["metadata_json", "bio"],
    )
    assert updated.status == SocialAccountStatus.PENDING.value
    assert "Changes requested:" in updated.last_error


def test_acceptance_service_pause_and_reactivate(session: Session):
    repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="bastar_waterfalls",
        profile_url="https://youtube.com/@bastar_waterfalls",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )
    saved_acc = repo.create(account)
    session.commit()

    service = SocialAcceptanceService(session_or_repo=repo)

    # Pause
    paused = service.pause(saved_acc.id)
    assert paused.status == SocialAccountStatus.PAUSED.value
    assert paused.sync_enabled is False

    # Reactivate
    reactivated = service.reactivate(saved_acc.id)
    assert reactivated.status == SocialAccountStatus.ACTIVE.value
    assert reactivated.sync_enabled is True
