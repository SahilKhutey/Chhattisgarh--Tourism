from __future__ import annotations

import logging
import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.social_content import SocialContent
from app.modules.social.workflows.guards import assert_geography_valid

logger = logging.getLogger(__name__)


class TourismContextWorkflow:
    """
    Workflow for assigning and validating regional tourism context
    (District, Tourism Zone, Place Entity, Experience, Festival).
    Sections 9.29, 9.30, 9.38, 9.39, 9.40.
    """

    def __init__(
        self,
        session: Session,
        publisher: SocialEventPublisher | None = None,
        audit: SocialAuditService | None = None,
    ) -> None:
        self.session = session
        self.publisher = publisher or SocialEventPublisher(session)
        self.audit = audit or SocialAuditService(session)

    def assign_tourism_context(
        self,
        content_id: uuid.UUID,
        *,
        district_id: str,
        place_id: uuid.UUID | None = None,
        place_slug: str | None = None,
        place_name: str | None = None,
        tourism_zone_id: str | None = None,
        experience_id: str | None = None,
        festival_name: str | None = None,
        actor_id: str | None = None,
    ) -> SocialContent:
        """
        Validates geographical relationships and assigns canonical tourism entities.
        Prevents cross-district mismatches (e.g. Chitrakote Falls assigned to unrelated district).
        """
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        # Validate geography integrity (Section 9.30)
        assert_geography_valid(district_id, place_slug=place_slug)

        content.district_id = district_id.lower().strip()
        if place_slug:
            content.place_slug = place_slug.lower().strip()
        if place_id:
            content.place_id = place_id
        elif content.place_slug and not content.place_id:
            content.place_id = uuid.uuid5(uuid.NAMESPACE_DNS, f"place.{content.place_slug}")

        if place_name:
            content.place_name = place_name.strip()
        elif place_slug and not content.place_name:
            content.place_name = place_slug.replace("-", " ").title()

        if tourism_zone_id:
            content.tourism_zone_id = tourism_zone_id
        if experience_id:
            content.experience_id = experience_id
        if festival_name:
            content.festival_name = festival_name.strip()

        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.TOURISM_CONTEXT_ASSIGNED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={
                "district_id": content.district_id,
                "place_slug": content.place_slug,
                "place_id": str(content.place_id) if content.place_id else None,
                "festival_name": content.festival_name,
            },
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.tourism_context_assigned",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
            details=event.metadata,
        )
        return content


__all__ = ["TourismContextWorkflow"]
