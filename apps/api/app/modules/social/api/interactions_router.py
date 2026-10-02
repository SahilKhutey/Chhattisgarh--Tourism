from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import (
    get_optional_user,
    require_auth,
)
from app.modules.social.schemas.content_schemas import (
    AddToTripRequest,
    AddToTripResponse,
)
from app.modules.social.schemas.interaction_schemas import (
    CommentCreateRequest,
    CommentResponse,
    LikeResponse,
    SaveResponse,
    ShareRequest,
    ShareResponse,
)
from app.modules.social.services.interaction_service import InteractionService

router = APIRouter(prefix="/social/interactions", tags=["social-interactions"])


@router.post("/{content_id}/like", response_model=LikeResponse)
def toggle_like(
    content_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> LikeResponse:
    service = InteractionService(db)
    return service.toggle_like(content_id=content_id, user_id=user.id)


@router.post("/{content_id}/save", response_model=SaveResponse)
def toggle_save(
    content_id: UUID,
    collection: str = Query("Default"),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> SaveResponse:
    service = InteractionService(db)
    return service.toggle_save(content_id=content_id, user_id=user.id, collection=collection)


@router.post("/{content_id}/comment", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    content_id: UUID,
    req: CommentCreateRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> CommentResponse:
    service = InteractionService(db)
    return service.add_comment(content_id=content_id, user_id=user.id, req=req)


@router.post("/{content_id}/share", response_model=ShareResponse)
def record_share(
    content_id: UUID,
    req: ShareRequest,
    db: Session = Depends(get_db),
    user: AdminUser | None = Depends(get_optional_user),
) -> ShareResponse:
    service = InteractionService(db)
    user_id = user.id if user else None
    return service.record_share(content_id=content_id, user_id=user_id, req=req)


@router.post("/{content_id}/trip-add", response_model=AddToTripResponse)
def add_to_trip(
    content_id: UUID,
    req: AddToTripRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> AddToTripResponse:
    """
    Connects social discovery directly to the Trip Planning system.
    Records the traveler's intent and feeds regional demand intelligence.
    """
    service = InteractionService(db)
    return service.add_to_trip(content_id=content_id, user_id=user.id, req=req)
