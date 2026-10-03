from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentVisibility,
    ModerationDecision,
    ModerationStatus,
)
from app.modules.social.domain.state_machines import ContentStateMachine
from app.modules.social.models.moderation import SocialModerationLog
from app.modules.social.models.social_content import SocialContent


class SocialModerationService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.content_repo = SocialContentRepository(session)

    def _get_content_or_404(self, content_id: uuid.UUID) -> SocialContent:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found.", status_code=404)
        return content

    def approve(
        self,
        content_id: uuid.UUID,
        moderator_id: uuid.UUID,
        reason: str = "Meets community standards",
        cultural_notes: str | None = None,
    ) -> SocialContent:
        content = self._get_content_or_404(content_id)
        current = ContentStatus(content.publication_status)

        content.moderation_status = ModerationStatus.APPROVED.value
        content.publication_status = ContentStatus.PUBLISHED.value
        content.visibility = ContentVisibility.PUBLIC.value

        log = SocialModerationLog(
            content_id=content.id,
            moderator_id=moderator_id,
            decision=ModerationDecision.APPROVE.value,
            reason=reason,
            cultural_notes=cultural_notes,
        )
        self.content_repo.add_moderation_log(log)

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_CONTENT_MODERATED,
            aggregate_id=content.id,
            payload={
                "content_id": str(content.id),
                "moderator_id": str(moderator_id),
                "decision": ModerationDecision.APPROVE.value,
            },
        )
        self.session.commit()
        return content

    def reject(
        self,
        content_id: uuid.UUID,
        moderator_id: uuid.UUID,
        reason: str,
        cultural_notes: str | None = None,
    ) -> SocialContent:
        content = self._get_content_or_404(content_id)

        content.moderation_status = ModerationStatus.REJECTED.value
        content.publication_status = ContentStatus.REJECTED.value

        log = SocialModerationLog(
            content_id=content.id,
            moderator_id=moderator_id,
            decision=ModerationDecision.REJECT.value,
            reason=reason,
            cultural_notes=cultural_notes,
        )
        self.content_repo.add_moderation_log(log)

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_CONTENT_MODERATED,
            aggregate_id=content.id,
            payload={
                "content_id": str(content.id),
                "moderator_id": str(moderator_id),
                "decision": ModerationDecision.REJECT.value,
                "reason": reason,
            },
        )
        self.session.commit()
        return content

    def hide(self, content_id: uuid.UUID, reason: str) -> SocialContent:
        content = self._get_content_or_404(content_id)
        content.publication_status = ContentStatus.HIDDEN.value
        content.visibility = ContentVisibility.PRIVATE.value
        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_CONTENT_ARCHIVED,
            aggregate_id=content.id,
            payload={"content_id": str(content.id), "reason": reason},
        )
        self.session.commit()
        return content

    def restore(self, content_id: uuid.UUID) -> SocialContent:
        content = self._get_content_or_404(content_id)
        content.publication_status = ContentStatus.PUBLISHED.value
        content.visibility = ContentVisibility.PUBLIC.value
        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_CONTENT_PUBLISHED,
            aggregate_id=content.id,
            payload={"content_id": str(content.id)},
        )
        self.session.commit()
        return content


__all__ = ["SocialModerationService"]
