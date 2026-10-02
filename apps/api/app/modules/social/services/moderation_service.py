from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.modules.social.domain.enums import (
    ContentStatus,
    ModerationDecision,
    ModerationStatus,
)
from app.modules.social.domain.state_machines import ContentStateMachine
from app.modules.social.models.moderation import SocialModerationLog
from app.modules.social.models.social_content import SocialContent
from app.modules.social.repositories.social_content_repository import (
    SocialContentRepository,
)
from app.modules.social.schemas.moderation_schemas import (
    ModerationQueueItemResponse,
    ModerationReviewRequest,
)
from app.modules.social.services.social_content_service import (
    ContentNotFoundError,
    SocialContentService,
)


class ModerationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.content_repo = SocialContentRepository(db)
        self.content_service = SocialContentService(db)

    def get_queue(self, limit: int = 50, offset: int = 0) -> list[ModerationQueueItemResponse]:
        contents = self.content_repo.list_pending_moderation(limit=limit, offset=offset)
        queue_items = []
        for c in contents:
            queue_items.append(
                ModerationQueueItemResponse(
                    content_id=c.id,
                    creator_id=c.creator_id,
                    creator_handle=c.creator.handle if c.creator else "unknown",
                    title=c.title,
                    content_type=c.content_type,
                    district_id=c.district_id,
                    cultural_sensitivity=c.cultural_sensitivity,
                    license_type=c.license_type,
                    has_sacred_consent=c.has_sacred_consent,
                    community_attribution=c.community_attribution,
                    media_count=len(c.media_items),
                    created_at=c.created_at,
                )
            )
        return queue_items

    def review_content(
        self,
        content_id: UUID,
        moderator_id: UUID,
        review: ModerationReviewRequest,
        auto_publish_on_approve: bool = True,
    ) -> SocialContent:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))

        log = SocialModerationLog(
            content_id=content.id,
            moderator_id=moderator_id,
            decision=review.decision.value,
            reason=review.reason.strip(),
            cultural_notes=review.cultural_notes.strip() if review.cultural_notes else None,
        )
        self.content_repo.add_moderation_log(log)

        current_status = ContentStatus(content.publication_status)

        if review.decision == ModerationDecision.APPROVE:
            content.moderation_status = ModerationStatus.APPROVED.value
            ContentStateMachine.transition(current_status, ContentStatus.APPROVED)
            content.publication_status = ContentStatus.APPROVED.value

            if auto_publish_on_approve:
                self.content_service.publish_content(content.id)

        elif review.decision == ModerationDecision.REJECT:
            content.moderation_status = ModerationStatus.REJECTED.value
            ContentStateMachine.transition(current_status, ContentStatus.REJECTED)
            content.publication_status = ContentStatus.REJECTED.value

        elif review.decision == ModerationDecision.REQUEST_CHANGES:
            content.moderation_status = ModerationStatus.PENDING.value
            ContentStateMachine.transition(current_status, ContentStatus.DRAFT)
            content.publication_status = ContentStatus.DRAFT.value

        elif review.decision == ModerationDecision.ESCALATE:
            content.moderation_status = ModerationStatus.ESCALATED_CULTURAL_COMMITTEE.value

        create_outbox_event(
            self.db,
            event_type="SOCIAL_CONTENT_MODERATED",
            aggregate_id=content.id,
            payload={
                "content_id": str(content.id),
                "moderator_id": str(moderator_id),
                "decision": review.decision.value,
                "reason": review.reason,
            },
        )

        self.db.commit()
        return content
