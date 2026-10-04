import pytest
import uuid
from sqlalchemy.orm import Session

from app.modules.social.acceptance.service import SocialAcceptanceService
from app.modules.social.accounts.schemas import SocialAccountRegisterRequest
from app.modules.social.accounts.service import SocialAccountService
from app.modules.social.creators.schemas import CreatorCreate
from app.modules.social.creators.service import CreatorService
from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus, SocialPlatform
from app.modules.social.domain.errors import AccountNotAcceptedError, AccountSyncDisabledError
from app.modules.social.eligibility.service import SocialEligibilityService
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.adapters.youtube_adapter import YouTubeAdapter
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.repositories.social_account_repository import SocialAccountRepository
from app.modules.social.verification.service import SocialVerificationService


def test_eligibility_end_to_end_positive_flow(session: Session):
    """
    End-to-End Positive Validation & Acceptance Flow:
    1. Register Creator -> validated
    2. Creator verified & activated
    3. Register Social Account -> validated
    4. Account verified with Provider Adapter -> status VERIFIED
    5. Admin accepts account -> status ACTIVE, sync_enabled True
    6. Eligibility service confirms can_sync is True
    """
    # 1. Setup services
    creator_service = CreatorService(session)
    provider_registry = ProviderRegistry()
    provider_registry.register(YouTubeAdapter())
    account_repo = SocialAccountRepository(session)
    verification_service = SocialVerificationService(
        provider_registry=provider_registry,
        account_repository=account_repo,
    )
    acceptance_service = SocialAcceptanceService(session_or_repo=account_repo)
    eligibility_service = SocialEligibilityService()

    account_service = SocialAccountService(session)

    # 2. Register & activate Creator
    creator_in = CreatorCreate(
        handle="chhattisgarh_explorers",
        display_name="Chhattisgarh Explorers",
        district_id="bastar",
        bio="Documenting scenic waterfalls, caves, and ancient temples across Bastar.",
        tourism_zone="BASTAR_CULTURE",
    )
    creator = creator_service.create_creator(creator_in)
    creator_service.verify_creator(creator.id, is_verified=True)
    creator_service.activate_creator(creator.id)
    assert creator.status == CreatorStatus.ACTIVE.value

    # 3. Register Social Account
    acc_req = SocialAccountRegisterRequest(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE,
        handle="chhattisgarh_explorers",
        profile_url="https://www.youtube.com/@chhattisgarh_explorers",
        content_types_allowed=["VIDEO", "SHORT"],
    )
    # Registration validates URL and handle format
    account = account_service.register_social_account(creator.id, acc_req, auto_verify=False)
    assert account.status == SocialAccountStatus.PENDING.value

    # 4. Fail-closed: Cannot sync in PENDING state
    assert eligibility_service.can_sync(account, creator, engine_enabled=True) is False
    with pytest.raises(AccountNotAcceptedError):
        eligibility_service.assert_eligible_for_sync(account, creator, engine_enabled=True)

    # 5. External Provider Verification
    v_res = verification_service.verify_account_sync(account)
    assert v_res.verified is True
    refreshed_acc = account_repo.get_by_id(account.id)
    assert refreshed_acc.status == SocialAccountStatus.VERIFIED.value

    # Still fail-closed before acceptance!
    assert eligibility_service.can_sync(refreshed_acc, creator, engine_enabled=True) is False

    # 6. Editorial Acceptance
    accepted_acc = acceptance_service.accept(
        refreshed_acc.id,
        approved_content_types=["VIDEO", "SHORT"],
        priority=85,
        reason="Verified authentic high quality tourism corridor content",
    )
    assert accepted_acc.status == SocialAccountStatus.ACTIVE.value
    assert accepted_acc.sync_enabled is True

    # 7. Final Eligibility Gate Passed!
    assert eligibility_service.can_sync(accepted_acc, creator, engine_enabled=True) is True
    assert eligibility_service.can_display(accepted_acc) is True
    # Should not raise
    eligibility_service.assert_eligible_for_sync(accepted_acc, creator, engine_enabled=True)


def test_eligibility_end_to_end_rejection_flow(session: Session):
    """
    End-to-End Negative Validation & Rejection Flow:
    1. Register Creator & Account
    2. Admin rejects account with explicit reason
    3. Eligibility service confirms can_sync is False
    """
    account_repo = SocialAccountRepository(session)
    acceptance_service = SocialAcceptanceService(session_or_repo=account_repo)
    eligibility_service = SocialEligibilityService()

    creator = Creator(
        handle="spammer_handle",
        display_name="Spam Promos",
        district_id="raipur",
        status=CreatorStatus.ACTIVE.value,
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="spammer_handle",
        profile_url="https://youtube.com/@spammer_handle",
        status=SocialAccountStatus.PENDING_ACCEPTANCE.value,
    )
    saved_acc = account_repo.create(account)
    session.commit()

    # Reject account
    rejected = acceptance_service.reject(
        saved_acc.id,
        reason="Commercial drop-shipping channel unrelated to CG Tourism",
        reason_code="OFF_TOPIC",
    )
    assert rejected.status == SocialAccountStatus.REJECTED.value
    assert rejected.sync_enabled is False

    # Eligibility checks
    assert eligibility_service.can_sync(rejected, creator, engine_enabled=True) is False
    assert eligibility_service.can_display(rejected) is False
    with pytest.raises(AccountNotAcceptedError, match="Account is not in ACTIVE state"):
        eligibility_service.assert_eligible_for_sync(rejected, creator, engine_enabled=True)


def test_eligibility_fail_closed_edge_cases():
    service = SocialEligibilityService()

    active_creator = Creator(
        handle="active_creator",
        display_name="Active Creator",
        district_id="bastar",
        status=CreatorStatus.ACTIVE.value,
    )

    pending_creator = Creator(
        handle="pending_creator",
        display_name="Pending Creator",
        district_id="bastar",
        status=CreatorStatus.PENDING.value,
    )

    active_acc = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="active_handle",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )

    paused_acc = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="paused_handle",
        status=SocialAccountStatus.PAUSED.value,
        sync_enabled=False,
    )

    sync_disabled_acc = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="disabled_sync_handle",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=False,
    )

    # 1. Engine globally disabled
    assert service.can_sync(active_acc, active_creator, engine_enabled=False) is False
    with pytest.raises(AccountSyncDisabledError, match="globally disabled"):
        service.assert_eligible_for_sync(active_acc, active_creator, engine_enabled=False)

    # 2. Inactive creator
    assert service.can_sync(active_acc, pending_creator, engine_enabled=True) is False
    with pytest.raises(AccountNotAcceptedError, match="is not ACTIVE"):
        service.assert_eligible_for_sync(active_acc, pending_creator, engine_enabled=True)

    # 3. Paused account
    assert service.can_sync(paused_acc, active_creator, engine_enabled=True) is False
    with pytest.raises(AccountNotAcceptedError, match="Account is not in ACTIVE state"):
        service.assert_eligible_for_sync(paused_acc, active_creator, engine_enabled=True)

    # 4. Sync disabled on active account
    assert service.can_sync(sync_disabled_acc, active_creator, engine_enabled=True) is False
    with pytest.raises(AccountSyncDisabledError, match="synchronization is disabled"):
        service.assert_eligible_for_sync(sync_disabled_acc, active_creator, engine_enabled=True)
