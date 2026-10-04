import pytest
import uuid
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import SocialPlatform, SocialAccountStatus
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.providers.adapters.youtube_adapter import YouTubeAdapter
from app.modules.social.providers.adapters.instagram_adapter import InstagramAdapter
from app.modules.social.repositories.social_account_repository import SocialAccountRepository
from app.modules.social.creators.repository import CreatorRepository
from app.modules.social.verification.service import SocialVerificationService, CreatorVerificationService
from app.modules.social.verification.results import (
    CreatorVerificationLevel,
    VerificationStatus,
)


class MockFailingProvider:
    def verify_account(self, identifier: str):
        raise ConnectionError("Upstream API connection refused")


class MockNotFoundProvider:
    def verify_account(self, identifier: str):
        class Profile:
            is_valid = False
            handle = identifier
            external_id = None
        return Profile()


def test_social_verification_success(session: Session):
    registry = ProviderRegistry()
    registry.register(YouTubeAdapter())
    repo = SocialAccountRepository(session)
    creator_repo = CreatorRepository(session)

    creator = Creator(
        handle="dantewada_trails",
        display_name="Dantewada Trails",
        district_id="dantewada",
    )
    creator_repo.create(creator)

    account = SocialAccount(
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="dantewada_trails",
        profile_url="https://www.youtube.com/@dantewada_trails",
        status=SocialAccountStatus.PENDING.value,
    )
    saved_acc = repo.create(account)
    session.commit()

    service = SocialVerificationService(
        provider_registry=registry,
        account_repository=repo,
    )

    res = service.verify_account_sync(saved_acc)
    assert res.verified is True
    assert res.status == VerificationStatus.VERIFIED
    assert res.external_account_id is not None
    assert res.external_account_id.startswith("UC_")

    # Verify database state was updated
    refreshed = repo.get_by_id(saved_acc.id)
    assert refreshed.status == SocialAccountStatus.VERIFIED.value
    assert refreshed.external_account_id == res.external_account_id


def test_social_verification_provider_error(session: Session):
    class ErrorRegistry:
        def get(self, platform):
            return MockFailingProvider()

    repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.YOUTUBE.value,
        handle="unknown_error",
        profile_url="https://youtube.com/@unknown_error",
        status=SocialAccountStatus.PENDING.value,
    )

    service = SocialVerificationService(
        provider_registry=ErrorRegistry(),
        account_repository=repo,
    )

    res = service.verify_account_sync(account)
    assert res.verified is False
    assert res.status == VerificationStatus.PROVIDER_ERROR
    assert "Upstream API connection refused" in res.reason


def test_social_verification_not_found(session: Session):
    class NotFoundRegistry:
        def get(self, platform):
            return MockNotFoundProvider()

    repo = SocialAccountRepository(session)
    account = SocialAccount(
        creator_id=uuid.uuid4(),
        platform=SocialPlatform.INSTAGRAM.value,
        handle="non_existent",
        profile_url="https://instagram.com/non_existent",
        status=SocialAccountStatus.PENDING.value,
    )

    service = SocialVerificationService(
        provider_registry=NotFoundRegistry(),
        account_repository=repo,
    )

    res = service.verify_account_sync(account)
    assert res.verified is False
    assert res.status == VerificationStatus.NOT_FOUND


def test_creator_verification_service(session: Session):
    creator_repo = CreatorRepository(session)
    creator = Creator(
        handle="bastar_heritage",
        display_name="Bastar Heritage Foundation",
        district_id="bastar",
        is_verified=False,
    )
    creator = creator_repo.create(creator)
    session.commit()

    service = CreatorVerificationService(creator_repository=creator_repo)
    updated = service.verify_level(
        creator_id=creator.id,
        level=CreatorVerificationLevel.OFFICIAL_CREATOR,
        notes="Verified official Chhattisgarh tourism partner",
    )

    assert updated.is_verified is True
    assert updated.metadata_json["verification_level"] == "OFFICIAL_CREATOR"
    assert updated.metadata_json["verification_notes"] == "Verified official Chhattisgarh tourism partner"
