from __future__ import annotations

import logging
import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.audit.service import SocialAuditService
from app.modules.social.domain.enums import SocialContentStatus, SocialPlatform
from app.modules.social.events.definitions import (
    SocialWorkflowEvent,
    SocialWorkflowEventType,
)
from app.modules.social.events.publisher import SocialEventPublisher
from app.modules.social.models.social_content import SocialContent
from app.modules.social.policies.content_policy import SocialContentPolicy

logger = logging.getLogger(__name__)


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


class ContentValidationWorkflow:
    """
    Workflow for content validation, deduplication check, and source lifecycle.
    Sections 9.24, 9.25, 9.42.
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

    def validate_content(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
    ) -> SocialContent:
        """
        Validates content fields, source URL against domain allowlist,
        and transitions status from DISCOVERED -> VALIDATED.
        """
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        # 1. Source URL validation
        platform_val = _val(content.provider)
        valid_url, url_err = SocialContentPolicy.validate_source_url(content.source_url, platform_val)
        if not valid_url:
            raise AppError(code="INVALID_SOURCE_URL", message=f"Invalid source URL: {url_err}", status_code=422)

        # 2. Transition to VALIDATED
        content.status = SocialContentStatus.VALIDATED
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_VALIDATED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={"status": _val(content.status), "platform": platform_val},
        )
        self.publisher.publish(event)
        return content

    def mark_source_deleted(
        self,
        content_id: uuid.UUID,
        actor_id: str | None = None,
        reason: str = "Source video removed from provider platform",
    ) -> SocialContent:
        """
        Handles source disappearance (Section 9.42):
        Transitions to SOURCE_DELETED, removing item from public feed
        while preserving audit history and relationships.
        """
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        content.status = SocialContentStatus.SOURCE_DELETED
        meta = content.metadata_json or {}
        meta["source_deleted_reason"] = reason
        content.metadata_json = meta
        self.session.add(content)
        self.session.flush()

        event = SocialWorkflowEvent(
            event_type=SocialWorkflowEventType.CONTENT_SOURCE_DELETED,
            aggregate_type="SocialContent",
            aggregate_id=str(content.id),
            actor_id=actor_id,
            metadata={"reason": reason},
        )
        self.publisher.publish(event)
        self.audit.record(
            action="content.source_deleted",
            target_type="SocialContent",
            target_id=content.id,
            actor=actor_id,
            details={"reason": reason},
        )
        return content

    def check_duplicate(self, platform: SocialPlatform | str, provider_content_id: str) -> SocialContent | None:
        """Checks for existing record on (platform, provider_content_id)."""
        stmt = select(SocialContent).where(
            SocialContent.provider == platform,
            SocialContent.provider_content_id == provider_content_id,
        )
        return self.session.scalars(stmt).first()


__all__ = ["ContentValidationWorkflow"]
