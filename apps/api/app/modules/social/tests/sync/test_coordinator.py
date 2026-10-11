from datetime import datetime, timezone
from unittest.mock import MagicMock
import uuid
import pytest

from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    ProviderAccessStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SyncStatus,
)
from app.modules.social.domain.errors import (
    AccountNotAcceptedError,
    SyncAlreadyRunningError,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_state import SocialAccountSyncState
from app.modules.social.providers.base import NormalizedSocialItem, SyncResult as ProviderSyncResult
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.coordinator import SocialSyncCoordinator
from app.modules.social.sync.locking import InMemorySocialSyncLock


@pytest.fixture
def creator(session):
    c = Creator(
        id=uuid.uuid4(),
        display_name="Ravi Bastar",
        slug="ravi-bastar",
        bio="Bastar Culture",
        status=CreatorStatus.ACTIVE.value,
        district_id="bastar",
    )
    session.add(c)
    session.commit()
    return c


@pytest.fixture
def active_account(session, creator):
    acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="bastar_vibes",
        profile_url="https://youtube.com/@bastar_vibes",
        status=SocialAccountStatus.ACTIVE.value,
        sync_status=SyncStatus.NEVER_RUN.value,
        is_sync_enabled=True,
        provider_access_status=ProviderAccessStatus.AVAILABLE.value,
        max_items=10,
    )
    session.add(acc)
    state = SocialAccountSyncState(
        social_account_id=acc.id,
        sync_status=SyncStatus.NEVER_RUN.value,
        sync_enabled=True,
    )
    session.add(state)
    session.commit()
    return acc


def test_coordinator_successful_sync(session, active_account):
    mock_provider = MagicMock()
    mock_provider.platform = SocialPlatform.YOUTUBE
    mock_provider.fetch_content.return_value = ProviderSyncResult(
        items=[
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id="vid_101",
                content_type=ContentType.VIDEO,
                title="Bastar Dussehra Journey",
                description="Exploring the 75-day long festival",
                source_url="https://youtube.com/watch?v=vid_101",
                thumbnail_url="https://img.youtube.com/vi/vid_101/0.jpg",
                published_at=datetime.now(timezone.utc),
            ),
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id="vid_102",
                content_type=ContentType.SHORT,
                title="Chitrakote Falls Sunset",
                description="The Niagara of India",
                source_url="https://youtube.com/shorts/vid_102",
                thumbnail_url="https://img.youtube.com/vi/vid_102/0.jpg",
                published_at=datetime.now(timezone.utc),
            ),
        ],
        next_cursor="cursor_page_2",
    )

    registry = ProviderRegistry([mock_provider])
    lock = InMemorySocialSyncLock()
    coordinator = SocialSyncCoordinator(
        session=session,
        lock=lock,
        provider_registry=registry,
    )

    result = coordinator.sync_account(active_account.id, trigger="manual")

    assert result.status == "succeeded"
    assert result.discovered == 2
    assert result.created == 2
    assert result.failed == 0
    assert result.next_cursor == "cursor_page_2"

    # Verify database updates
    session.refresh(active_account)
    assert active_account.sync_status == "succeeded"
    assert active_account.last_successful_sync is not None
    assert active_account.next_sync_at is not None
    assert active_account.consecutive_failures == 0

    # Verify sync run history
    runs = coordinator.run_repo.list_by_account(active_account.id)
    assert len(runs) == 1
    assert runs[0].status == "succeeded"
    assert runs[0].items_created == 2


def test_coordinator_partial_success(session, active_account):
    mock_provider = MagicMock()
    mock_provider.platform = SocialPlatform.YOUTUBE
    mock_provider.fetch_content.return_value = ProviderSyncResult(
        items=[
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id="valid_vid",
                content_type=ContentType.VIDEO,
                title="Valid Video",
                description="Valid description",
                source_url="https://youtube.com/watch?v=valid_vid",
                thumbnail_url="https://img.youtube.com/vi/valid_vid/0.jpg",
                published_at=datetime.now(timezone.utc),
            ),
            # Item with missing/invalid data causing normalization exception
            NormalizedSocialItem(
                provider=SocialPlatform.YOUTUBE,
                provider_content_id="bad_vid",
                content_type=ContentType.VIDEO,
                title=None,
                description=None,
                source_url="",  # Invalid source url triggers validation error
                thumbnail_url=None,
                published_at=datetime.now(timezone.utc),
            ),
        ],
        next_cursor=None,
    )

    registry = ProviderRegistry([mock_provider])
    coordinator = SocialSyncCoordinator(
        session=session,
        provider_registry=registry,
    )

    result = coordinator.sync_account(active_account.id)

    assert result.status == "partial"
    assert result.discovered == 2
    assert result.created == 1
    assert result.failed == 1

    session.refresh(active_account)
    assert active_account.sync_status == "partial"


def test_coordinator_fail_closed_eligibility(session, creator):
    pending_acc = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform="youtube",
        handle="pending_channel",
        status=SocialAccountStatus.PENDING.value,
        is_sync_enabled=True,
    )
    session.add(pending_acc)
    session.commit()

    coordinator = SocialSyncCoordinator(session=session)

    with pytest.raises(AccountNotAcceptedError):
        coordinator.sync_account(pending_acc.id)


def test_coordinator_mark_source_unavailable(session, active_account):
    from app.modules.social.models.social_content import SocialContent

    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=active_account.creator_id,
        social_account_id=active_account.id,
        provider="youtube",
        provider_content_id="deleted_vid",
        content_type="video",
        title="Vanishing Video",
        slug="vanishing-video",
        source_url="https://youtube.com/watch?v=deleted_vid",
        publication_status="PUBLISHED",
        metadata_json={},
    )
    session.add(content)
    session.commit()

    coordinator = SocialSyncCoordinator(session=session)
    coordinator.mark_source_unavailable(content.id)

    session.refresh(content)
    assert content.publication_status == "ARCHIVED"
    assert content.metadata_json.get("source_status") == SocialContentStatus.SOURCE_UNAVAILABLE.value
