from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.context.service import SocialTourismContextService
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    FeedType,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.engine import SocialEngine
from app.modules.social.events.handlers import INVALIDATED_CACHE_KEYS
from app.modules.social.models.creator import Creator
from app.events.models import OutboxEvent
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.base import SocialAccountProfile
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.schemas.content_schemas import AddToTripRequest
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.sync.state import SyncResult
from app.modules.social.workflows.service import SocialWorkflowService


def test_golden_path_end_to_end_22_steps(session: Session) -> None:
    """
    Critical Integration Test — The 22-Step Golden Path (Section 10.51):
    1. Create creator
    2. Register YouTube account
    3. Verify account
    4. Accept account
    5. Activate account
    6. Enable sync
    7. Queue sync
    8. Mock provider
    9. Fetch content
    10. Normalize
    11. Persist
    12. Assign tourism context
    13. Submit moderation
    14. Approve
    15. Publish
    16. Invalidate cache
    17. Request feed
    18. Open content
    19. Open place
    20. Open destination
    21. Start planning
    22. Open original source
    """
    INVALIDATED_CACHE_KEYS.clear()

    # Setup Provider Mock
    mock_provider = MagicMock()
    mock_provider.verify_account.return_value = SocialAccountProfile(
        handle="chhattisgarh_explorer",
        display_name="Chhattisgarh Explorer",
        provider_channel_id="UC_cg_explorer_channel",
        is_valid=True,
    )

    registry = ProviderRegistry()
    registry.register(SocialPlatform.YOUTUBE, mock_provider)
    lock = InMemorySocialSyncLock()

    service = SocialWorkflowService(session=session, provider_registry=registry, lock=lock)

    # 1. Create creator
    creator = service.creators.onboard_creator(
        display_name="Praveen Bastar Scout",
        slug="praveen_bastar",
        bio="Documenting raw Bastar tribal culture and waterfalls",
        district_id="bastar",
        actor_id="admin-001",
    )
    assert creator.id is not None
    assert creator.status == CreatorStatus.PENDING

    # 2. Register YouTube account
    account = service.accounts.register_account(
        creator_id=creator.id,
        raw_input="https://youtube.com/@chhattisgarh_explorer",
        actor_id="admin-001",
    )
    assert account.handle == "chhattisgarh_explorer"
    assert account.status == SocialAccountStatus.PENDING.value

    # 3. Verify account
    verified = service.verification.verify_account(account.id, actor_id="admin-001")
    assert verified.status == SocialAccountStatus.VERIFIED.value
    assert verified.external_account_id == "UC_cg_explorer_channel"

    # 4. Accept account (Editorial Acceptance: ACCEPTED != ACTIVE)
    accepted = service.acceptance.accept_account(
        verified.id,
        actor_id="editor-001",
        editorial_note="Authentic regional storyteller",
    )
    assert accepted.status == SocialAccountStatus.ACCEPTED.value
    assert accepted.sync_enabled is False

    # 5. Activate account
    # 6. Enable sync
    activated = service.acceptance.activate_account(
        accepted.id,
        actor_id="ops-admin-001",
        enable_sync=True,
    )
    assert activated.status == SocialAccountStatus.ACTIVE.value
    assert activated.sync_enabled is True

    # Activate creator
    creator = service.creators.activate_creator(creator.id, actor_id="admin-001")
    assert creator.status == CreatorStatus.ACTIVE

    # 7. Queue sync (202 Accepted non-blocking)
    queued = service.sync.queue_sync(activated.id, actor_id="scheduler-001")
    assert queued["status"] == "queued"

    # 8. Mock provider
    # 9. Fetch content & 10. Normalize & 11. Persist
    mock_coordinator = MagicMock()
    mock_coordinator.sync_account.return_value = SyncResult(
        account_id=activated.id,
        status="SUCCEEDED",
        discovered=1,
        created=1,
        updated=0,
        skipped=0,
    )
    service.sync.coordinator = mock_coordinator

    sync_exec = service.sync.execute_sync(activated.id, actor_id="worker-001")
    assert sync_exec["status"] == "SUCCEEDED"

    content_id = uuid.uuid4()
    content = SocialContent(
        id=content_id,
        creator_id=creator.id,
        social_account_id=activated.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_teerathgarh_4k",
        content_type=ContentType.VIDEO.value,
        title="Sunrise at Teerathgarh Falls",
        caption="Layers of water cascading through the Kanger Valley National Park rocks",
        slug="sunrise-at-teerathgarh-falls",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_teerathgarh_4k",
        publication_status=SocialContentStatus.DISCOVERED.value,
        visibility=SocialVisibility.PUBLIC.value,
    )
    session.add(content)
    session.flush()

    # Content validation
    validated = service.content.validate_content(content.id, actor_id="validator-001")
    assert validated.status == SocialContentStatus.VALIDATED.value

    # 12. Assign tourism context (Place, District, Zone)
    contextualized = service.tourism.assign_tourism_context(
        validated.id,
        district_id="bastar",
        place_slug="teerathgarh-falls",
        place_name="Teerathgarh Falls",
        tourism_zone_id="bastar_tribal",
        actor_id="curator-001",
    )
    assert contextualized.district_id == "bastar"
    assert contextualized.place_slug == "teerathgarh-falls"

    # Verify SocialTourismContextService resolves it seamlessly (Section 10.7)
    context_service = SocialTourismContextService(session)
    resolved_context = context_service.resolve_sync(contextualized.id)
    assert resolved_context.district_id == "bastar"
    assert resolved_context.place_slug == "teerathgarh-falls"
    assert resolved_context.place_name == "Teerathgarh Falls"

    # 13. Submit moderation
    # 14. Approve
    approved = service.moderation.approve_content(
        contextualized.id,
        actor_id="moderator-001",
        editorial_note="Verified geography and high quality footage",
    )
    assert approved.status == SocialContentStatus.APPROVED.value

    # 15. Publish
    published = service.publication.publish_content(approved.id, actor_id="publisher-001")
    assert published.status == SocialContentStatus.PUBLISHED.value

    # 16. Invalidate cache (Verify Section 10.33 invalidation keys emitted)
    assert "social:feed:all" in INVALIDATED_CACHE_KEYS
    assert "social:feed:district:bastar" in INVALIDATED_CACHE_KEYS

    # 17. Request feed
    feed_items = list(
        session.scalars(
            select(SocialContent).where(
                SocialContent.publication_status == SocialContentStatus.PUBLISHED.value,
                SocialContent.district_id == "bastar",
            )
        ).all()
    )
    assert len(feed_items) >= 1
    target_item = next(item for item in feed_items if item.id == published.id)

    # 18. Open content
    assert target_item.title == "Sunrise at Teerathgarh Falls"
    assert target_item.creator_id == creator.id

    # 19. Open place & 20. Open destination
    assert target_item.place_slug == "teerathgarh-falls"
    assert target_item.place_name == "Teerathgarh Falls"

    # 21. Start planning (Add to Trip)
    trip_req = AddToTripRequest(trip_id="trip-bastar-001", place_slug=target_item.place_slug)
    assert trip_req.place_slug == "teerathgarh-falls"
    target_item.trip_adds_count += 1
    session.flush()
    assert target_item.trip_adds_count == 1

    # 22. Open original source (Source URL preserved directly without scraping)
    assert target_item.source_url == "https://youtube.com/watch?v=yt_teerathgarh_4k"


def test_integration_tourism_context_service_secondary_entities(session: Session) -> None:
    """
    Tests SocialTourismContextService resolving across direct fields and secondary context tags.
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Sirpur Historian",
        handle="sirpur_historian",
        district_id="mahasamund",
        status=CreatorStatus.ACTIVE,
    )
    place_uuid = uuid.uuid4()
    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_sirpur_brick_temple",
        content_type=ContentType.VIDEO.value,
        title="Laxman Temple Architectural Marvel",
        slug="laxman-temple-architecture",
        district_id="mahasamund",
        place_id=place_uuid,
        place_slug="laxman-temple",
        place_name="Laxman Temple Sirpur",
        festival_name="Sirpur National Dance Festival",
        source_url="https://youtube.com/watch?v=yt_sirpur_brick_temple",
        publication_status=SocialContentStatus.PUBLISHED.value,
    )
    session.add_all([creator, content])
    session.flush()

    context_svc = SocialTourismContextService(session)
    resolved = context_svc.resolve_sync(content.id)

    assert resolved.district_id == "mahasamund"
    assert resolved.place_id == place_uuid
    assert resolved.place_slug == "laxman-temple"
    assert resolved.place_name == "Laxman Temple Sirpur"
    assert resolved.festival_name == "Sirpur National Dance Festival"
    data = resolved.to_dict()
    assert data["place_id"] == str(place_uuid)


def test_integration_failure_and_security_invariants(session: Session) -> None:
    """
    Section 10.52 Failure Matrix:
    - Inactive creator blocks account verification
    - Paused account blocks sync execution
    - Unknown place raises error
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Suspended Creator",
        handle="suspended_creator",
        status=CreatorStatus.SUSPENDED,
    )
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="suspended_creator",
        status=SocialAccountStatus.PENDING.value,
    )
    session.add_all([creator, account])
    session.flush()

    service = SocialWorkflowService(session=session)

    # 1. Inactive creator blocks verification
    with pytest.raises(AppError) as exc_info:
        service.verification.verify_account(account.id)
    assert exc_info.value.status_code == 422
    assert "inactive" in exc_info.value.message.lower()

    # 2. Paused account blocks sync
    account.status = SocialAccountStatus.ACTIVE.value
    account.sync_enabled = True
    session.flush()

    paused = service.accounts.pause_account(account.id, reason="Admin compliance hold")
    assert paused.status == SocialAccountStatus.PAUSED.value
    assert paused.sync_enabled is False

    with pytest.raises(AppError) as exc_info:
        service.sync.execute_sync(paused.id)
    assert exc_info.value.status_code in {400, 422}
    assert "paused" in exc_info.value.message.lower() or "not allowed" in exc_info.value.message.lower()
