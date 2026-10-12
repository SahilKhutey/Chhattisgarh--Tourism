from __future__ import annotations

import uuid
import pytest
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.models import OutboxEvent
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    CulturalSensitivityLevel,
    SocialAccountStatus,
    SocialContentStatus,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.workflows.moderation_workflow import ContentModerationWorkflow
from app.modules.social.workflows.publication_workflow import ContentPublicationWorkflow


@pytest.fixture
def content_fixtures(session: Session) -> tuple[Creator, SocialAccount, SocialContent]:
    creator = Creator(
        id=uuid.uuid4(),
        display_name="Bastar Documentarian",
        handle="bastar_doc",
        district_id="bastar",
        status=CreatorStatus.ACTIVE,
    )
    session.add(creator)
    session.flush()

    account = SocialAccount(
        id=uuid.uuid4(),
        creator_id=creator.id,
        platform=SocialPlatform.INSTAGRAM.value,
        handle="bastardoc",
        status=SocialAccountStatus.ACTIVE.value,
        is_sync_enabled=True,
    )
    session.add(account)
    session.flush()

    content = SocialContent(
        id=uuid.uuid4(),
        creator_id=creator.id,
        social_account_id=account.id,
        provider=SocialPlatform.INSTAGRAM.value,
        provider_content_id="post_1001",
        content_type=ContentType.POST.value,
        title="Dussehra Ritual in Jagdalpur",
        caption="Traditional Gond celebration of Bastar Dussehra",
        slug="dussehra-ritual-jagdalpur",
        district_id="bastar",
        source_url="https://instagram.com/p/post_1001",
        status=SocialContentStatus.VALIDATED.value,
        visibility=SocialVisibility.PUBLIC.value,
    )
    session.add(content)
    session.flush()
    return creator, account, content


def test_submit_for_review_and_approve(session: Session, content_fixtures: tuple[Creator, SocialAccount, SocialContent]) -> None:
    _, _, content = content_fixtures
    workflow = ContentModerationWorkflow(session)

    # 1. Submit for review
    reviewed = workflow.submit_for_review(content.id, actor_id="user-001")
    assert reviewed.status == SocialContentStatus.UNDER_REVIEW

    # 2. Approve
    approved = workflow.approve_content(content.id, actor_id="admin-001", editorial_note="Culturally verified")
    assert approved.status == SocialContentStatus.APPROVED
    assert approved.metadata_json.get("editorial_note") == "Culturally verified"

    # Verify outbox event
    events = session.query(OutboxEvent).all()
    types = [e.event_type for e in events]
    assert "social.content.under_review" in types
    assert "social.content.approved" in types


def test_cultural_protection_consent_gate(session: Session, content_fixtures: tuple[Creator, SocialAccount, SocialContent]) -> None:
    _, _, content = content_fixtures
    content.cultural_sensitivity = CulturalSensitivityLevel.SACRED_RITUAL
    content.has_sacred_consent = False
    content.community_attribution = None
    content.status = SocialContentStatus.UNDER_REVIEW
    session.flush()

    workflow = ContentModerationWorkflow(session)

    # Approval must be rejected due to lack of verified sacred clan consent
    with pytest.raises(AppError) as exc_info:
        workflow.approve_content(content.id, actor_id="admin-001")
    assert exc_info.value.code == "CULTURAL_CONSENT_VIOLATION"

    # Now verify clan consent and attach community attribution
    content.has_sacred_consent = True
    content.community_attribution = "Bastar Tribal Elders Council"
    session.flush()

    approved = workflow.approve_content(content.id, actor_id="admin-001")
    assert approved.status == SocialContentStatus.APPROVED


def test_reject_content(session: Session, content_fixtures: tuple[Creator, SocialAccount, SocialContent]) -> None:
    _, _, content = content_fixtures
    workflow = ContentModerationWorkflow(session)

    rejected = workflow.reject_content(content.id, actor_id="admin-001", reason="Duplicate submission")
    assert rejected.status == SocialContentStatus.REMOVED
    assert rejected.metadata_json.get("rejection_reason") == "Duplicate submission"


def test_hide_and_restore_content(session: Session, content_fixtures: tuple[Creator, SocialAccount, SocialContent]) -> None:
    _, _, content = content_fixtures
    workflow = ContentModerationWorkflow(session)

    # Set as published first
    content.status = SocialContentStatus.PUBLISHED
    session.flush()

    # Hide
    hidden = workflow.hide_content(content.id, actor_id="admin-001", reason="Temporary review")
    assert hidden.status == SocialContentStatus.HIDDEN
    assert hidden.visibility == SocialVisibility.HIDDEN

    # Restore
    restored = workflow.restore_content(content.id, actor_id="admin-001")
    assert restored.status == SocialContentStatus.PUBLISHED
    assert restored.visibility == SocialVisibility.PUBLIC


def test_publication_workflow(session: Session, content_fixtures: tuple[Creator, SocialAccount, SocialContent]) -> None:
    _, _, content = content_fixtures
    mod_wf = ContentModerationWorkflow(session)
    pub_wf = ContentPublicationWorkflow(session)

    content.status = SocialContentStatus.UNDER_REVIEW
    session.flush()

    # Approve
    mod_wf.approve_content(content.id, actor_id="admin-001")

    # Publish
    published = pub_wf.publish_content(content.id, actor_id="admin-001")
    assert published.status == SocialContentStatus.PUBLISHED
    assert published.visibility == SocialVisibility.PUBLIC

    # Outbox event
    events = session.query(OutboxEvent).all()
    pub_events = [e for e in events if e.event_type == "social.content.published"]
    assert len(pub_events) == 1
    assert pub_events[0].aggregate_id == content.id
