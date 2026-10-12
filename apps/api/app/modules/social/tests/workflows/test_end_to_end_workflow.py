from __future__ import annotations

import uuid
from unittest.mock import MagicMock
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.events.models import OutboxEvent
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
    SyncStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.providers.base import SocialAccountProfile
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.sync.locking import InMemorySocialSyncLock
from app.modules.social.sync.state import SyncResult
from app.modules.social.workflows.service import SocialWorkflowService


def test_complete_end_to_end_social_engine_workflow(session: Session) -> None:
    """
    End-to-End Orchestrated Lifecycle Test (Sections 9.1, 9.75):
    Creator Onboarding
      -> Handle Registry
      -> Verification
      -> Editorial Acceptance
      -> Operational Activation
      -> Sync
      -> Content Validation
      -> Moderation Review
      -> Publication
      -> Tourism Context Assign
      -> Consumer Discovery Feed
    """
    # 0. Setup Mock Provider
    mock_provider = MagicMock()
    mock_provider.verify_account.return_value = SocialAccountProfile(
        handle="bastar_nomad",
        display_name="Bastar Nomad Official",
        provider_channel_id="UC_bastar_nomad_channel",
        is_valid=True,
        metadata={"subscriber_count": 50000},
    )

    registry = ProviderRegistry()
    registry.register(SocialPlatform.YOUTUBE, mock_provider)
    lock = InMemorySocialSyncLock()

    service = SocialWorkflowService(session=session, provider_registry=registry, lock=lock)

    # 1. Admin Onboards Creator
    creator = service.creators.onboard_creator(
        display_name="Bastar Nomad",
        slug="bastar_nomad",
        bio="Documenting rivers, waterfalls, and tribal hamlets of southern Chhattisgarh",
        district_id="bastar",
        tourism_zone_id="bastar_tribal",
        actor_id="admin-001",
    )
    assert creator.id is not None
    assert creator.status == CreatorStatus.PENDING

    # Activate creator
    creator = service.creators.activate_creator(creator.id, actor_id="admin-001")
    assert creator.status == CreatorStatus.ACTIVE

    # 2. Register Social Account (Handle)
    account = service.accounts.register_account(
        creator_id=creator.id,
        raw_input="https://www.youtube.com/@bastar_nomad",
        actor_id="admin-001",
    )
    assert account.id is not None
    assert account.status == SocialAccountStatus.PENDING.value
    assert account.handle == "bastar_nomad"

    # 3. Provider Identity Verification
    verified_account = service.verification.verify_account(account.id, actor_id="admin-001")
    assert verified_account.status == SocialAccountStatus.VERIFIED.value
    assert verified_account.external_account_id == "UC_bastar_nomad_channel"
    assert verified_account.display_name == "Bastar Nomad Official"

    # 4. Editorial Acceptance Gate (ACCEPTED != ACTIVE)
    accepted_account = service.acceptance.accept_account(
        verified_account.id,
        actor_id="editor-001",
        editorial_note="Verified authentic local travel channel",
    )
    assert accepted_account.status == SocialAccountStatus.ACCEPTED.value
    assert accepted_account.sync_enabled is False  # Invariant: ACCEPTED != ACTIVE

    # 5. Operational Activation Gate
    active_account = service.acceptance.activate_account(
        accepted_account.id,
        actor_id="admin-ops-001",
        enable_sync=True,
    )
    assert active_account.status == SocialAccountStatus.ACTIVE.value
    assert active_account.sync_enabled is True

    # 6. Synchronization Execution
    mock_coordinator = MagicMock()
    mock_coordinator.sync_account.return_value = SyncResult(
        account_id=active_account.id,
        status="SUCCEEDED",
        discovered=1,
        created=1,
        updated=0,
        skipped=0,
    )
    service.sync.coordinator = mock_coordinator

    sync_result = service.sync.execute_sync(active_account.id, actor_id="scheduler-001")
    assert sync_result["status"].upper() == "SUCCEEDED"
    assert sync_result["items_synced"] == 1

    # 7. Ingest Content Item & Run Validation Workflow
    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=active_account.id,
        provider=SocialPlatform.YOUTUBE.value,
        provider_content_id="yt_chitrakote_4k",
        content_type=ContentType.VIDEO.value,
        title="Monsoon Thunder at Chitrakote Falls",
        caption="Witnessing India's Niagara Falls during peak monsoon overflow",
        slug="monsoon-thunder-chitrakote-falls",
        district_id="bastar",
        source_url="https://youtube.com/watch?v=yt_chitrakote_4k",
        status=SocialContentStatus.DISCOVERED.value,
        visibility=SocialVisibility.PUBLIC.value,
    )
    session.add(content)
    session.flush()

    validated_content = service.content.validate_content(content.id, actor_id="worker-001")
    assert validated_content.status == SocialContentStatus.VALIDATED.value

    # 8. Content Moderation & Editorial Approval
    approved_content = service.moderation.approve_content(
        validated_content.id,
        actor_id="moderator-001",
        editorial_note="Exceptional footage, approved for regional feed",
    )
    assert approved_content.status == SocialContentStatus.APPROVED.value

    # 9. Public Feed Publication
    published_content = service.publication.publish_content(approved_content.id, actor_id="publisher-001")
    assert published_content.status == SocialContentStatus.PUBLISHED.value
    assert published_content.visibility == SocialVisibility.PUBLIC.value

    # 10. Tourism Graph Context Assignment
    contextualized_content = service.tourism.assign_tourism_context(
        published_content.id,
        district_id="bastar",
        place_slug="chitrakote-falls",
        place_name="Chitrakote Falls",
        tourism_zone_id="bastar_tribal",
        actor_id="curator-001",
    )
    assert contextualized_content.district_id == "bastar"
    assert contextualized_content.place_slug == "chitrakote-falls"
    assert contextualized_content.place_name == "Chitrakote Falls"
    assert contextualized_content.place_id is not None

    # 11. Consumer Discovery Feed Verification
    # Consumer queries public feed for Bastar region
    stmt = (
        select(SocialContent)
        .where(
            SocialContent.status == SocialContentStatus.PUBLISHED.value,
            SocialContent.visibility == SocialVisibility.PUBLIC.value,
            SocialContent.district_id == "bastar",
        )
    )
    feed_items = list(session.scalars(stmt).all())
    assert len(feed_items) == 1
    feed_item = feed_items[0]

    assert feed_item.title == "Monsoon Thunder at Chitrakote Falls"
    assert feed_item.place_name == "Chitrakote Falls"
    assert feed_item.source_url == "https://youtube.com/watch?v=yt_chitrakote_4k"
    assert feed_item.creator_id == creator.id

    # 12. Transactional Outbox Integrity
    events = session.query(OutboxEvent).all()
    event_types = [e.event_type for e in events]

    assert "social.creator.created" in event_types
    assert "social.creator.activated" in event_types
    assert "social.account.registered" in event_types
    assert "social.account.verification_started" in event_types
    assert "social.account.verified" in event_types
    assert "social.account.accepted" in event_types
    assert "social.account.activated" in event_types
    assert "social.sync.started" in event_types
    assert "social.sync.completed" in event_types
    assert "social.content.validated" in event_types
    assert "social.content.approved" in event_types
    assert "social.content.published" in event_types
    assert "social.tourism.context_assigned" in event_types
