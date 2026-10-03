from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.social.accounts.schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountRegisterRequest,
    SocialAccountResponse,
    SocialAccountUpdate,
)
from app.modules.social.api.dependencies import require_admin
from app.modules.social.creators.schemas import CreatorCreate, CreatorResponse, CreatorUpdate
from app.modules.social.domain.enums import CreatorStatus, SocialAccountStatus, SocialPlatform
from app.modules.social.engine import SocialEngine
from app.modules.social.schemas.content_schemas import SocialContentResponse

admin_router = APIRouter(prefix="/admin", tags=["Social Admin & Moderation"])


@admin_router.post("/creators", response_model=CreatorResponse, status_code=status.HTTP_201_CREATED)
def create_creator(
    payload: CreatorCreate,
    auto_verify: bool = Query(False),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.create_creator(payload, actor=admin, auto_verify=auto_verify)


@admin_router.get("/creators", response_model=list[CreatorResponse])
def list_creators(
    district_id: str | None = Query(None),
    verified_only: bool = Query(False),
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.list_creators(
        district_id=district_id,
        verified_only=verified_only,
        status=status_filter,
        limit=limit,
        offset=offset,
    )


@admin_router.get("/creators/{creator_id}", response_model=CreatorResponse)
def get_creator(
    creator_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.get_creator(creator_id)


@admin_router.patch("/creators/{creator_id}", response_model=CreatorResponse)
def update_creator(
    creator_id: uuid.UUID,
    payload: CreatorUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.update_creator(creator_id, payload, actor=admin)


@admin_router.post("/creators/{creator_id}/verify", response_model=CreatorResponse)
def verify_creator(
    creator_id: uuid.UUID,
    is_verified: bool = Query(True),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.creators.verify_creator(creator_id, is_verified=is_verified, actor=admin)


@admin_router.post("/accounts", response_model=SocialAccountResponse, status_code=status.HTTP_201_CREATED)
def register_social_account(
    payload: SocialAccountRegisterRequest,
    auto_verify: bool = Query(True),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.register_social_account(
        creator_id=payload.creator_id,
        payload=payload,
        auto_verify=auto_verify,
    )


@admin_router.get("/accounts", response_model=list[SocialAccountResponse])
def list_social_accounts(
    creator_id: uuid.UUID | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    platform: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.list_accounts(
        creator_id=creator_id,
        status=status_filter,
        platform=platform,
        limit=limit,
        offset=offset,
    )


@admin_router.get("/accounts/{account_id}", response_model=SocialAccountResponse)
def get_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.get_account(account_id)


@admin_router.post("/accounts/{account_id}/verify", response_model=SocialAccountResponse)
def verify_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.verify_social_account(account_id)


@admin_router.post("/accounts/{account_id}/accept", response_model=SocialAccountResponse)
def accept_social_account(
    account_id: uuid.UUID,
    payload: SocialAccountAcceptPayload,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.accept_social_account(account_id, payload)


@admin_router.post("/accounts/{account_id}/reject", response_model=SocialAccountResponse)
def reject_social_account(
    account_id: uuid.UUID,
    reason: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.reject_social_account(account_id, reason=reason)


@admin_router.post("/accounts/{account_id}/pause", response_model=SocialAccountResponse)
def pause_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.pause_social_account(account_id)


@admin_router.post("/accounts/{account_id}/reactivate", response_model=SocialAccountResponse)
def reactivate_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.accounts.reactivate_social_account(account_id)


@admin_router.post("/sync/{account_id}")
def sync_account(
    account_id: uuid.UUID,
    force: bool = Query(False),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    res = engine.sync.sync_account(account_id, force=force)
    return {
        "account_id": str(res.account_id),
        "status": res.status,
        "discovered": res.discovered,
        "created": res.created,
        "updated": res.updated,
        "skipped": res.skipped,
        "failed": res.failed,
        "next_cursor": res.next_cursor,
        "error": res.error,
    }


@admin_router.post("/sync")
def sync_all_accounts(
    limit: int | None = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    results = engine.sync.sync_all_active_accounts(limit=limit)
    return [
        {
            "account_id": str(r.account_id),
            "status": r.status,
            "discovered": r.discovered,
            "created": r.created,
            "updated": r.updated,
            "skipped": r.skipped,
            "failed": r.failed,
            "error": r.error,
        }
        for r in results
    ]


@admin_router.post("/moderation/{content_id}/approve", response_model=SocialContentResponse)
def approve_content(
    content_id: uuid.UUID,
    notes: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.moderation.approve(content_id, moderator_id=admin.id, reason=notes or "Approved by admin")


@admin_router.post("/moderation/{content_id}/reject", response_model=SocialContentResponse)
def reject_content(
    content_id: uuid.UUID,
    reason: str = Query(...),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.moderation.reject(content_id, moderator_id=admin.id, reason=reason)


__all__ = ["admin_router"]
