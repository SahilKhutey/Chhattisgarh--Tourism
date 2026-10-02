from __future__ import annotations

import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import (
    require_auth,
)
from app.modules.social.schemas.content_schemas import (
    SocialContentCreateRequest,
    SocialContentResponse,
)
from app.modules.social.services.social_content_service import (
    SocialContentService,
)

router = APIRouter(prefix="/social/content", tags=["social-content"])


@router.post("/", response_model=SocialContentResponse, status_code=status.HTTP_201_CREATED)
def create_social_content(
    req: SocialContentCreateRequest,
    auto_submit: bool = Query(True, description="Submit immediately to moderation"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> SocialContentResponse:
    service = SocialContentService(db)
    content = service.create_content(user_id=user.id, req=req, auto_submit=auto_submit)
    return SocialContentResponse.model_validate(content)


@router.get("/{id_or_slug}", response_model=SocialContentResponse)
def get_social_content(
    id_or_slug: str,
    db: Session = Depends(get_db),
) -> SocialContentResponse:
    service = SocialContentService(db)
    try:
        content_id = UUID(id_or_slug)
        content = service.get_by_id(content_id)
    except ValueError:
        content = service.get_by_slug(id_or_slug)

    return SocialContentResponse.model_validate(content)


@router.post("/{content_id}/submit", response_model=SocialContentResponse)
def submit_social_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> SocialContentResponse:
    service = SocialContentService(db)
    content = service.submit_for_moderation(content_id=content_id, user_id=user.id)
    return SocialContentResponse.model_validate(content)
