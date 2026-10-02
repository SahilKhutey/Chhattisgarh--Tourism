from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import (
    require_admin,
    require_auth,
)
from app.modules.social.schemas.creator_schemas import (
    CreatorRegisterRequest,
    CreatorResponse,
    CreatorUpdateRequest,
)
from app.modules.social.schemas.interaction_schemas import FollowResponse
from app.modules.social.services.creator_service import CreatorService

router = APIRouter(prefix="/social/creators", tags=["social-creators"])


@router.post("/register", response_model=CreatorResponse, status_code=status.HTTP_201_CREATED)
def register_creator(
    req: CreatorRegisterRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> CreatorResponse:
    service = CreatorService(db)
    # Admin roles can auto-verify during creation
    auto_verify = user.role in {"ADMIN", "SUPER_ADMIN"}
    creator = service.register_creator(user_id=user.id, req=req, auto_verify=auto_verify)
    return CreatorResponse.model_validate(creator)


@router.get("/me", response_model=CreatorResponse)
def get_my_creator_profile(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> CreatorResponse:
    service = CreatorService(db)
    creator = service.get_by_user_id(user.id)
    return CreatorResponse.model_validate(creator)


@router.patch("/me", response_model=CreatorResponse)
def update_my_creator_profile(
    req: CreatorUpdateRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> CreatorResponse:
    service = CreatorService(db)
    creator = service.update_profile(user.id, req)
    return CreatorResponse.model_validate(creator)


@router.get("/{handle}", response_model=CreatorResponse)
def get_creator_by_handle(
    handle: str,
    db: Session = Depends(get_db),
) -> CreatorResponse:
    service = CreatorService(db)
    creator = service.get_by_handle(handle)
    return CreatorResponse.model_validate(creator)


@router.get("/", response_model=list[CreatorResponse])
def list_creators(
    district_id: str | None = Query(None, description="Filter by district (e.g., bastar, surguja)"),
    verified_only: bool = Query(False, description="Filter by verified status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[CreatorResponse]:
    service = CreatorService(db)
    creators = service.list_creators(district_id=district_id, verified_only=verified_only, limit=limit, offset=offset)
    return [CreatorResponse.model_validate(c) for c in creators]


@router.post("/{creator_id}/verify", response_model=CreatorResponse)
def verify_creator(
    creator_id: UUID,
    is_verified: bool = Query(True),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(require_admin),
) -> CreatorResponse:
    service = CreatorService(db)
    creator = service.set_verification(creator_id, is_verified=is_verified)
    return CreatorResponse.model_validate(creator)


@router.post("/{creator_id}/follow", response_model=FollowResponse)
def follow_creator(
    creator_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_auth),
) -> FollowResponse:
    service = CreatorService(db)
    followed, count = service.toggle_follow(creator_id=creator_id, follower_user_id=user.id)
    return FollowResponse(creator_id=creator_id, following=followed, followers_count=count)
