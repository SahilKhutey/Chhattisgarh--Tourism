from __future__ import annotations

import logging
import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import SocialContentStatus, SocialVisibility
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.policies.publication_policy import SocialPublicationPolicy
from app.modules.social.workflows.guards import assert_content_publishable

logger = logging.getLogger(__name__)


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class ContentPublicationWorkflow:
    """
    Workflow for publishing approved content to the public feed and cache invalidation.
    Sections 9.32, 9.71.
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

    def publish_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
    ) -> SocialContent:
        """
        Executes publication workflow:
        1. Validates publishing eligibility
        2. Transitions APPROVED -> PUBLISHED
        3. Invalidates feed cache via event publisher
        4. Emits outbox event and logs audit
        """
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        creator = self.session.get(Creator, content.creator_id) if content.creator_id else None
        account = self.session.get(SocialAccount, content.social_account_id) if content.social_account_id else None

        assert_content_publishable(content, creator=creator, account=account)

        content.status = SocialContentStatus.PUBLISHED
        content.visibility = SocialVisibility.PUBLIC
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_PUBLISHED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={
                "status": _val(content.status),
                "creator_id": str(content.creator_id) if content.creator_id else None,
                "district_id": content.district_id,
                "place_slug": content.place_slug,
            },
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.published",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
            details=event.metadata,
        )
        return content


__all__ = ["ContentPublicationWorkflow"]
