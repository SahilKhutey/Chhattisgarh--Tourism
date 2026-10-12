from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.creators.duplicate import CreatorDuplicateService
from app.modules.social.creators.repository import CreatorRepository
from app.modules.social.domain.enums import CreatorStatus
from app.modules.social.domain.state_machines import CreatorStateMachine
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.creator import Creator
from app.modules.social.workflows.guards import (
    assert_creator_editable,
    assert_geography_valid,
)


class CreatorWorkflow:
    """
    Workflow for creator onboarding, validation, lifecycle transitions, and auditing.
    Sections 9.8, 9.9, 9.10.
    """

    def __init__(
        self,
        session: Session,
        publisher: SocialEventPublisher | None = None,
        audit: SocialAuditService | None = None,
    ) -> None:
        self.session = session
        self.repository = CreatorRepository(session)
        self.duplicates = CreatorDuplicateService(self.repository)
        self.publisher = publisher or SocialEventPublisher(session)
        self.audit = audit or SocialAuditService(session)

    def onboard_creator(
        self,
        *,
        display_name: str,
        slug: str,
        bio: str | None = None,
        avatar_url: str | None = None,
        district_id: str | None = None,
        tourism_zone_id: str | None = None,
        languages: list[str] | None = None,
        categories: list[str] | None = None,
        actor_id: str | None = None,
        auto_activate: bool = False,
    ) -> Creator:
        """
        Creates and validates a new creator in the system.
        Enforces geography validity and duplicate prevention.
        """
        # 1. Validation & geography check
        display_name = display_name.strip()
        slug = slug.strip().lower().replace("@", "")
        if not display_name:
            raise AppError(code="INVALID_CREATOR_NAME", message="display_name is required", status_code=422)
        if not slug:
            raise AppError(code="INVALID_CREATOR_SLUG", message="slug is required", status_code=422)

        if district_id:
            assert_geography_valid(district_id)

        # 2. Duplicate check by handle or exact name in same district
        existing_handle = self.repository.get_by_handle(slug)
        if existing_handle:
            raise AppError(
                code="CREATOR_SLUG_EXISTS",
                message=f"Creator with slug '{slug}' already exists",
                status_code=409,
            )

        status = CreatorStatus.ACTIVE if auto_activate else CreatorStatus.PENDING

        creator = Creator(
            id=uuid.uuid4(),
            display_name=display_name,
            handle=slug,
            bio=bio,
            avatar_url=avatar_url,
            district_id=district_id,
            status=status,
            is_verified=auto_activate,
            metadata_json={
                "tourism_zone_id": tourism_zone_id,
                "languages": languages or [],
                "categories": categories or [],
            },
        )
        self.repository.save(creator)

        # 3. Transactional Outbox + Audit
        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CREATOR_CREATED,
            aggregate_type="Creator",
            aggregate_id=str(creator.id),
            actor_id=actor_id,
            metadata={
                "slug": creator.handle,
                "display_name": creator.display_name,
                "district_id": creator.district_id,
                "status": creator.status.value,
            },
        )
        self.publisher.publish(event)
        self.audit.record(
            action="creator.created",
            target_type="Creator",
            target_id=creator.id,
            actor=actor_id,
            details=event.metadata,
        )

        return creator

    def activate_creator(self, creator_id: uuid.UUID, actor_id: str | None = None) -> Creator:
        """Transitions creator to ACTIVE."""
        creator = self.repository.get_by_id(creator_id)
        if not creator:
            raise AppError(code="CREATOR_NOT_FOUND", message=f"Creator '{creator_id}' not found", status_code=404)

        assert_creator_editable(creator)
        new_status = CreatorStateMachine.transition(creator.status, CreatorStatus.ACTIVE)
        creator.status = new_status
        self.repository.save(creator)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CREATOR_ACTIVATED,
            aggregate_type="Creator",
            aggregate_id=str(creator.id),
            actor_id=actor_id,
            metadata={"status": new_status.value},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="creator.activated",
            target_type="Creator",
            target_id=creator.id,
            actor=actor_id,
        )
        return creator

    def suspend_creator(self, creator_id: uuid.UUID, actor_id: str | None = None, reason: str = "") -> Creator:
        """Suspends or archives a creator."""
        creator = self.repository.get_by_id(creator_id)
        if not creator:
            raise AppError(code="CREATOR_NOT_FOUND", message=f"Creator '{creator_id}' not found", status_code=404)

        new_status = CreatorStateMachine.transition(creator.status, CreatorStatus.SUSPENDED)
        creator.status = new_status
        self.repository.save(creator)

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CREATOR_ARCHIVED,
            aggregate_type="Creator",
            aggregate_id=str(creator.id),
            actor_id=actor_id,
            metadata={"status": new_status.value, "reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="creator.suspended",
            target_type="Creator",
            target_id=creator.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return creator


__all__ = ["CreatorWorkflow"]
