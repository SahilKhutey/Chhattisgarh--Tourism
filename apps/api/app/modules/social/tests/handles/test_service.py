import uuid
import pytest

from app.core.errors import AppError
from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus, SocialPlatform, SyncStatus
from app.modules.social.domain.errors import SocialAccountAlreadyExistsError
from app.modules.social.handles.service import SocialHandleService
from app.modules.social.models.creator import Creator


@pytest.fixture
def test_creator(session):
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Ravi Bastar",
        slug="ravi-bastar",
        bio="Documenting Bastar culture",
        status=CreatorStatus.ACTIVE.value,
        district_id="bastar",
    )
    session.add(creator)
    session.commit()
    return creator


@pytest.fixture
def second_creator(session):
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Sunita Raipur",
        slug="sunita-raipur",
        bio="Raipur food and travel",
        status=CreatorStatus.ACTIVE.value,
        district_id="raipur",
    )
    session.add(creator)
    session.commit()
    return creator


def test_register_handle_success(session, test_creator):
    service = SocialHandleService(session)

    account = service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.YOUTUBE,
        handle="@BastarTravels",
        sync_enabled=False,
    )

    assert account.id is not None
    assert account.creator_id == test_creator.id
    assert account.platform == "youtube"
    assert account.handle == "bastartravels"
    assert account.profile_url == "https://www.youtube.com/@bastartravels"
    assert account.status == SocialAccountStatus.PENDING.value
    assert account.sync_status == SyncStatus.NEVER_RUN.value
    assert account.is_sync_enabled is False

    # Check dedicated sync state record was initialized
    assert account.sync_state is not None
    assert account.sync_state.sync_status == SyncStatus.NEVER_RUN.value


def test_register_duplicate_handle_same_platform_rejected(session, test_creator, second_creator):
    service = SocialHandleService(session)

    # First registration succeeds
    service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.INSTAGRAM,
        handle="bastar.stories",
    )

    # Second registration with exact same platform & handle by another creator is rejected
    with pytest.raises(SocialAccountAlreadyExistsError) as exc_info:
        service.register(
            creator_id=second_creator.id,
            platform=SocialPlatform.INSTAGRAM,
            handle="@Bastar.Stories",
        )
    assert exc_info.value.handle == "bastar.stories"
    assert exc_info.value.platform == "instagram"


def test_register_same_handle_different_platform_allowed(session, test_creator):
    service = SocialHandleService(session)

    yt_acc = service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.YOUTUBE,
        handle="bastar_vibes",
    )

    ig_acc = service.register(
        creator_id=test_creator.id,
        platform=SocialPlatform.INSTAGRAM,
        handle="bastar_vibes",
    )

    assert yt_acc.platform == "youtube"
    assert ig_acc.platform == "instagram"
    assert yt_acc.handle == "bastar_vibes"
    assert ig_acc.handle == "bastar_vibes"


def test_register_handle_nonexistent_creator_raises(session):
    service = SocialHandleService(session)

    with pytest.raises(AppError) as exc_info:
        service.register(
            creator_id=uuid.uuid4(),
            platform=SocialPlatform.YOUTUBE,
            handle="ghost_channel",
        )
    assert exc_info.value.code == "CREATOR_NOT_FOUND"
