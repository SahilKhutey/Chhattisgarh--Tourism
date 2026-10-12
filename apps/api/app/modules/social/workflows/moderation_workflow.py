from __future__ import annotations

import logging
import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import (
    CulturalSensitivityLevel,
    SocialContentStatus,
    SocialVisibility,
)
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.social_content import SocialContent
from app.modules.social.policies.content_policy import SocialContentPolicy
from app.modules.social.workflows.guards import assert_content_moderatable

logger = logging.getLogger(__name__)


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class ContentModerationWorkflow:
    """
    Workflow for content moderation decisions, cultural sensitivity enforcement,
    and audit trail logging.
    Sections 9.26, 9.27, 9.28.
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

    def submit_for_review(self, content_id: uuid.UUID, actor_id: str | None = None) -> SocialContent:
        """Transitions content to UNDER_REVIEW."""
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        content.status = SocialContentStatus.UNDER_REVIEW
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_UNDER_REVIEW,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
        )
        self.publisher.publish(event)
        return content

    def approve_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
        editorial_note: str | None = None,
    ) -> SocialContent:
        """
        Approves content after enforcing cultural protection rules (Section 9.28).
        Transitions UNDER_REVIEW -> APPROVED.
        """
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        assert_content_moderatable(content)

        # Enforce cultural sensitivity and clan consent (Section 9.28)
        valid_cultural, issues = SocialContentPolicy.validate_cultural_protection(content)
        if not valid_cultural:
            raise AppError(
                code="CULTURAL_CONSENT_VIOLATION",
                message=f"Cultural consent violation: {'; '.join(issues)}",
                status_code=422,
            )

        content.status = SocialContentStatus.APPROVED
        meta = content.metadata_json or {}
        if editorial_note:
            meta["editorial_note"] = editorial_note
        content.metadata_json = meta
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_APPROVED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={"status": _val(content.status), "note": editorial_note},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.approved",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
            details={"status": _val(content.status), "note": editorial_note},
        )
        return content

    def reject_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
        reason: str = "Does not meet community standards",
    ) -> SocialContent:
        """Rejects content during moderation."""
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        assert_content_moderatable(content)

        content.status = SocialContentStatus.REMOVED
        meta = content.metadata_json or {}
        meta["rejection_reason"] = reason
        content.metadata_json = meta
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_REJECTED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={"reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.rejected",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return content

    def hide_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
        reason: str = "Hidden by administrator",
    ) -> SocialContent:
        """Hides published content from consumer feed."""
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        content.status = SocialContentStatus.HIDDEN
        content.visibility = SocialVisibility.HIDDEN
        meta = content.metadata_json or {}
        meta["hide_reason"] = reason
        content.metadata_json = meta
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_HIDDEN,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={"reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.hidden",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return content

    def restore_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
    ) -> SocialContent:
        """Restores previously hidden content back to published state."""
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        content.status = SocialContentStatus.PUBLISHED
        content.visibility = SocialVisibility.PUBLIC
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_RESTORED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.restored",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
        )
        return content


__all__ = ["ContentModerationWorkflow"]
