from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AppError
from app.modules.admin.dependencies import AdminUser
from app.modules.social.acceptance.schemas import (
    AcceptanceDecisionPayload,
    RejectionPayload,
    RequestChangesPayload,
)
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


@admin_router.post("/creators/validate")
def validate_creator_payload(
    payload: CreatorCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    result = engine.creators.validate_creator(
        display_name=payload.display_name,
        slug=payload.handle,
        bio=payload.bio,
        district_id=payload.district_id,
        tourism_zone_id=None,
    )
    return {
        "valid": result.valid,
        "issues": [
            {"field": i.field, "code": i.code, "message": i.message}
            for i in result.issues
        ],
    }


@admin_router.post("/creators/duplicates")
def check_creator_duplicates(
    display_name: str = Query(...),
    district_id: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.duplicate.find_candidates_sync(
        display_name=display_name,
        district_id=district_id,
    )


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


@admin_router.post("/accounts/{account_id}/submit", response_model=SocialAccountResponse)
def submit_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.acceptance.submit(account_id, actor_id=admin.id)


@admin_router.post("/accounts/{account_id}/accept", response_model=SocialAccountResponse)
def accept_social_account(
    account_id: uuid.UUID,
    payload: SocialAccountAcceptPayload,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.acceptance.accept(
        account=account_id,
        actor_id=admin.id,
        approved_content_types=payload.approved_content_types,
        priority=payload.priority,
    )


@admin_router.post("/accounts/{account_id}/reject", response_model=SocialAccountResponse)
def reject_social_account(
    account_id: uuid.UUID,
    payload: RejectionPayload | None = None,
    reason: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    rejection_reason = (payload.reason if payload else None) or reason
    reason_code = payload.reason_code if payload else None
    if not rejection_reason or not rejection_reason.strip():
        raise AppError(code="REJECTION_REASON_REQUIRED", message="A rejection reason is required.", status_code=422)
    return engine.acceptance.reject(
        account=account_id,
        actor_id=admin.id,
        reason=rejection_reason,
        reason_code=reason_code,
    )


@admin_router.post("/accounts/{account_id}/request-changes", response_model=SocialAccountResponse)
def request_changes_social_account(
    account_id: uuid.UUID,
    payload: RequestChangesPayload,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.acceptance.request_changes(
        account=account_id,
        actor_id=admin.id,
        reason=payload.reason,
        requested_fields=payload.requested_fields,
    )


@admin_router.post("/accounts/{account_id}/activate", response_model=SocialAccountResponse)
def activate_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.acceptance.activate(account=account_id, actor_id=admin.id)


@admin_router.get("/accounts/{account_id}/eligibility")
def check_account_eligibility(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    account = engine.accounts.get_account(account_id)
    creator = engine.creators.get_creator(account.creator_id)
    can_sync = engine.eligibility.can_sync(account, creator=creator)
    can_display = engine.eligibility.can_display(account)
    return {
        "account_id": str(account.id),
        "status": account.status,
        "sync_enabled": account.sync_enabled,
        "can_sync": can_sync,
        "can_display": can_display,
    }


@admin_router.post("/accounts/{account_id}/pause", response_model=SocialAccountResponse)
def pause_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.acceptance.pause(account_id, actor_id=admin.id)


@admin_router.post("/accounts/{account_id}/reactivate", response_model=SocialAccountResponse)
def reactivate_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialEngine(db)
    return engine.acceptance.reactivate(account_id, actor_id=admin.id)


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
