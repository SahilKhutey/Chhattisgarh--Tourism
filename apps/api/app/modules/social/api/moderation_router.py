from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import require_moderator
from app.modules.social.schemas.content_schemas import SocialContentResponse
from app.modules.social.schemas.moderation_schemas import (
    ModerationQueueItemResponse,
    ModerationReviewRequest,
)
from app.modules.social.services.moderation_service import ModerationService
from app.modules.social.services.social_content_service import (
    SocialContentService,
)

router = APIRouter(prefix="/social/admin/moderation", tags=["social-moderation"])


@router.get("/queue", response_model=list[ModerationQueueItemResponse])
def get_moderation_queue(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _moderator: AdminUser = Depends(require_moderator),
) -> list[ModerationQueueItemResponse]:
    service = ModerationService(db)
    return service.get_queue(limit=limit, offset=offset)


@router.post("/{content_id}/review", response_model=SocialContentResponse)
def review_social_content(
    content_id: UUID,
    req: ModerationReviewRequest,
    auto_publish_on_approve: bool = Query(True),
    db: Session = Depends(get_db),
    moderator: AdminUser = Depends(require_moderator),
) -> SocialContentResponse:
    service = ModerationService(db)
    content = service.review_content(
        content_id=content_id,
        moderator_id=moderator.id,
        review=req,
        auto_publish_on_approve=auto_publish_on_approve,
    )
    return SocialContentResponse.model_validate(content)


@router.post("/{content_id}/evergreen", response_model=SocialContentResponse)
def convert_to_evergreen(
    content_id: UUID,
    db: Session = Depends(get_db),
    moderator: AdminUser = Depends(require_moderator),
) -> SocialContentResponse:
    """
    Promotes valuable community/festival stories to permanent evergreen cultural archives.
    """
    service = SocialContentService(db)
    content = service.make_story_evergreen(content_id=content_id, moderator_id=moderator.id)
    return SocialContentResponse.model_validate(content)
