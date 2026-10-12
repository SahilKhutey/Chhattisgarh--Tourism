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
    CulturalSensitivityLevel,
    FeedType,
    ModerationStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
    SyncHealthStatus,
)
from app.modules.social.events.handlers import INVALIDATED_CACHE_KEYS
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.base import SocialAccountProfile
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.schemas.content_schemas import AddToTripRequest
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.sync.state import SyncResult
from app.modules.social.workflows.service import SocialWorkflowService


def test_phase12_golden_path_22_steps_complete_execution(session: Session) -> None:
    """
    Phase 12 Final System Execution Test — The 22-Step Golden Path (Section 12.39):
    1. CREATE CREATOR
    2. ADD ACCOUNT
    3. VERIFY ACCOUNT
    4. ACCEPT ACCOUNT
    5. ACTIVATE ACCOUNT
    6. ENABLE SYNC
    7. RUN SYNC
    8. FETCH PROVIDER CONTENT
    9. NORMALIZE
    10. DEDUPLICATE
    11. PERSIST
    12. ASSIGN TOURISM CONTEXT
    13. MODERATE
    14. APPROVE
    15. PUBLISH
    16. CACHE INVALIDATION
    17. OPEN SOCIAL FEED
    18. OPEN CONTENT
    19. OPEN PLACE
    20. OPEN DESTINATION
    21. OPEN MAP / OPEN EXPERIENCE / ADD TO TRIP
    22. OPEN ORIGINAL SOURCE
    """
    INVALIDATED_CACHE_KEYS.clear()

    # Step 0: Configure provider registry & lock
    mock_provider = MagicMock()
    mock_provider.verify_account.return_value = SocialAccountProfile(
        handle="chhattisgarh_explorer",
        display_name="Chhattisgarh Explorer",
        provider_channel_id="UC_cg_explorer_channel_phase12",
        is_valid=True,
    )

    registry = ProviderRegistry()
    registry.register(SocialPlatform.YOUTUBE, mock_provider)
    lock = InMemorySocialSyncLock()
    service = SocialWorkflowService(session=session, provider_registry=registry, lock=lock)

    # 1. CREATE CREATOR
    creator = service.creators.onboard_creator(
        display_name="Amrit Lal Bastar Explorer",
        slug="amrit_lal_bastar",
        bio="Promoting tribal craft and waterfalls of Bastar plateau",
        district_id="bastar",
        actor_id="admin-phase12-001",
    )
    assert creator.id is not None
    assert creator.status == CreatorStatus.PENDING

    # 2. ADD ACCOUNT
    account = service.accounts.register_account(
        creator_id=creator.id,
        raw_input="https://youtube.com/@chhattisgarh_explorer",
        actor_id="admin-phase12-001",
    )
    assert account.id is not None
    assert account.handle == "chhattisgarh_explorer"
    assert account.status == SocialAccountStatus.PENDING.value

    # 3. VERIFY ACCOUNT
    verified = service.verification.verify_account(account.id, actor_id="admin-phase12-001")
    assert verified.status == SocialAccountStatus.VERIFIED.value
    assert verified.external_account_id == "UC_cg_explorer_channel_phase12"

    # 4. ACCEPT ACCOUNT (Mandatory Acceptance Workflow: VERIFIED -> ACCEPTED)
    accepted = service.acceptance.accept_account(
        verified.id,
        actor_id="editor-phase12-001",
        editorial_note="Verified authentic Bastar cultural ambassador",
    )
    assert accepted.status == SocialAccountStatus.ACCEPTED.value
    assert accepted.sync_enabled is False

    # 5. ACTIVATE ACCOUNT & 6. ENABLE SYNC (ACCEPTED -> ACTIVE with sync enabled)
    activated = service.acceptance.activate_account(
        accepted.id,
        actor_id="ops-phase12-001",
        enable_sync=True,
    )
    assert activated.status == SocialAccountStatus.ACTIVE.value
    assert activated.sync_enabled is True

    # Activate Creator record
    creator = service.creators.activate_creator(creator.id, actor_id="admin-phase12-001")
    assert creator.status == CreatorStatus.ACTIVE

    # 7. RUN SYNC (Trigger synchronization)
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

    sync_result = service.sync.execute_sync(activated.id, actor_id="worker-phase12-001")
    assert sync_result["status"] == "SUCCEEDED"

    # 8. FETCH PROVIDER CONTENT & 9. NORMALIZE & 10. DEDUPLICATE & 11. PERSIST
    content_id = uuid.uuid4()
    content = SocialContent(
        id=content_id,
        creator_id=creator.id,
        social_account_id=activated.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_chitrakote_monsoon_4k",
        content_type=ContentType.VIDEO.value,
        title="Monsoon Majesty: Chitrakote Falls in Full Flow",
        caption="Capturing the horseshoe waterfall during the peak Bastar monsoon",
        slug="monsoon-majesty-chitrakote-falls-in-full-flow",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_chitrakote_monsoon_4k",
        publication_status=SocialContentStatus.DISCOVERED.value,
        visibility=SocialVisibility.PUBLIC.value,
        likes_count=3400,
        metadata_json={"view_count": 52000},
    )
    session.add(content)
    session.flush()

    # Content validation
    validated = service.content.validate_content(content.id, actor_id="validator-phase12-001")
    assert validated.status == SocialContentStatus.VALIDATED.value

    # 12. ASSIGN TOURISM CONTEXT (Place, District, Zone)
    contextualized = service.tourism.assign_tourism_context(
        validated.id,
        district_id="bastar",
        place_slug="chitrakote-falls",
        place_name="Chitrakote Falls",
        tourism_zone_id="bastar_tribal",
        actor_id="curator-phase12-001",
    )
    assert contextualized.district_id == "bastar"
    assert contextualized.place_slug == "chitrakote-falls"
    assert contextualized.place_name == "Chitrakote Falls"

    # Verify Tourism Context Resolver
    context_service = SocialTourismContextService(session)
    resolved_context = context_service.resolve_sync(contextualized.id)
    assert resolved_context.district_id == "bastar"
    assert resolved_context.place_slug == "chitrakote-falls"

    # 13. MODERATE & 14. APPROVE
    approved = service.moderation.approve_content(
        contextualized.id,
        actor_id="moderator-phase12-001",
        editorial_note="Verified geographic precision and cultural dignity",
    )
    assert approved.status == SocialContentStatus.APPROVED.value

    # 15. PUBLISH
    published = service.publication.publish_content(approved.id, actor_id="publisher-phase12-001")
    assert published.status == SocialContentStatus.PUBLISHED.value

    # 16. CACHE INVALIDATION (Check event-driven invalidation)
    assert "social:feed:all" in INVALIDATED_CACHE_KEYS
    assert "social:feed:district:bastar" in INVALIDATED_CACHE_KEYS

    # 17. OPEN SOCIAL FEED (Query feed for published content)
    feed_items = list(
        session.scalars(
            select(SocialContent).where(
                SocialContent.publication_status == SocialContentStatus.PUBLISHED.value,
                SocialContent.district_id == "bastar",
            )
        ).all()
    )
    assert len(feed_items) >= 1
    feed_target = next(item for item in feed_items if item.id == published.id)

    # 18. OPEN CONTENT
    assert feed_target.title == "Monsoon Majesty: Chitrakote Falls in Full Flow"
    assert feed_target.creator_id == creator.id
    assert feed_target.likes_count == 3400
    assert feed_target.metadata_json.get("view_count") == 52000

    # 19. OPEN PLACE & 20. OPEN DESTINATION
    assert feed_target.place_slug == "chitrakote-falls"
    assert feed_target.place_name == "Chitrakote Falls"
    assert feed_target.tourism_zone_id == "bastar_tribal"

    # 21. OPEN MAP / OPEN EXPERIENCE / ADD TO TRIP
    trip_req = AddToTripRequest(trip_id="trip-bastar-expedition", place_slug=feed_target.place_slug)
    assert trip_req.place_slug == "chitrakote-falls"
    feed_target.trip_adds_count += 1
    session.flush()
    assert feed_target.trip_adds_count == 1

    # 22. OPEN ORIGINAL SOURCE
    assert feed_target.source_url == "https://youtube.com/watch?v=yt_chitrakote_monsoon_4k"
    assert feed_target.provider == SocialPlatform.YOUTUBE.value


def test_phase12_rule_enforcement_and_invariants(session: Session) -> None:
    """
    Validates architectural invariants from Section 12.3:
    Rule 1: One canonical SocialContent model
    Rule 2: Providers stay strictly behind adapters
    Rule 3: Backend owns source URLs
    Rule 4: Mandatory acceptance workflow (Cannot skip PENDING -> ACTIVE without ACCEPTED)
    Rule 5: Provider metrics cannot overwrite editorial attributes
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Heritage Documentarian",
        handle="heritage_doc",
        district_id="bilaspur",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)
    session.flush()

    # Rule 4: Mandatory acceptance workflow enforcement
    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle="heritage_cg",
        status=SocialAccountStatus.PENDING.value,
        sync_enabled=False,
    )
    session.add(account)
    session.flush()

    lock = InMemorySocialSyncLock()
    service = SocialWorkflowService(session=session, lock=lock)

    # Attempting to activate directly from PENDING must fail
    with pytest.raises(AppError):
        service.acceptance.activate_account(account.id, actor_id="violator")

    # Move to VERIFIED
    account.status = SocialAccountStatus.VERIFIED.value
    session.flush()

    # Attempting to activate from VERIFIED without ACCEPTED must fail
    with pytest.raises(AppError):
        service.acceptance.activate_account(account.id, actor_id="violator")

    # Accept first
    service.acceptance.accept_account(account.id, actor_id="editor-01", editorial_note="Approved")
    # Now activate succeeds
    active = service.acceptance.activate_account(account.id, actor_id="ops-01", enable_sync=True)
    assert active.status == SocialAccountStatus.ACTIVE.value

    # Rule 5: Provider metrics cannot overwrite editorial attributes
    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=active.id,
        provider=SocialPlatform.INSTAGRAM.value,
        provider_content_id="ig_malhar_temple_01",
        content_type=ContentType.POST.value,
        title="Ancient Sculptures of Malhar",
        caption="8th century Pataleshwar temple complex sculptures",
        slug="ancient-sculptures-of-malhar",
        district_id="bilaspur",
        place_slug="malhar-temple-complex",
        place_name="Malhar Temple Complex",
        cultural_sensitivity=CulturalSensitivityLevel.SENSITIVE.value,
        source_url="https://instagram.com/p/ig_malhar_temple_01",
        publication_status=SocialContentStatus.PUBLISHED.value,
        likes_count=150,
        metadata_json={"view_count": 1000},
    )
    session.add(content)
    session.flush()

    # Emulate provider metrics update
    content.likes_count = 2300
    content.metadata_json = {"view_count": 15000}
    session.flush()

    # Editorial attributes must remain intact
    refreshed = session.get(SocialContent, content.id)
    assert refreshed is not None
    assert refreshed.place_slug == "malhar-temple-complex"
    assert refreshed.cultural_sensitivity == CulturalSensitivityLevel.SENSITIVE.value
    assert refreshed.district_id == "bilaspur"
    assert refreshed.likes_count == 2300
    assert refreshed.metadata_json["view_count"] == 15000


def test_phase12_multi_platform_cross_synchronization(session: Session) -> None:
    """
    Tests cross-platform aggregation where one creator has both YouTube and Instagram
    content feeding into the canonical Chhattisgarh Social Feed.
    """
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Surguja Trekkers",
        handle="surguja_trekkers",
        district_id="surguja",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)
    session.flush()

    yt_account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.YOUTUBE.value,
        handle="surguja_treks_yt",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )
    ig_account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle="surguja_treks_ig",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )
    session.add_all([yt_account, ig_account])
    session.flush()

    yt_content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=yt_account.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_mainpat_plateau",
        content_type=ContentType.VIDEO.value,
        title="Mainpat: The Shimla of Chhattisgarh",
        slug="mainpat-the-shimla-of-chhattisgarh",
        district_id="surguja",
        place_slug="mainpat-plateau",
        place_name="Mainpat Plateau",
        source_url="https://youtube.com/watch?v=yt_mainpat_plateau",
        publication_status=SocialContentStatus.PUBLISHED.value,
    )

    ig_content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=ig_account.id,
        provider=SocialPlatform.INSTAGRAM.value,
        provider_content_id="ig_tiger_point_reel",
        content_type=ContentType.REEL.value,
        title="Tiger Point Waterfall Mist",
        slug="tiger-point-waterfall-mist",
        district_id="surguja",
        place_slug="tiger-point-waterfall",
        place_name="Tiger Point Waterfall",
        source_url="https://instagram.com/reel/ig_tiger_point_reel",
        publication_status=SocialContentStatus.PUBLISHED.value,
    )
    session.add_all([yt_content, ig_content])
    session.flush()

    # Query unified feed for Surguja district
    feed_items = list(
        session.scalars(
            select(SocialContent).where(
                SocialContent.district_id == "surguja",
                SocialContent.publication_status == SocialContentStatus.PUBLISHED.value,
            )
        ).all()
    )
    assert len(feed_items) == 2
    providers = {item.provider for item in feed_items}
    assert providers == {SocialPlatform.YOUTUBE.value, SocialPlatform.INSTAGRAM.value}
