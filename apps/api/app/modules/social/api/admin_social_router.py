from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.social.api.dependencies import require_admin
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.schemas.account_schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountResponse,
    SocialAccountUpdate,
)
from app.modules.social.schemas.creator_schemas import CreatorResponse
from app.modules.social.schemas.template_schemas import (
    FeedTemplateCreate,
    FeedTemplateResponse,
)
from app.modules.social.services.feed_template_service import FeedTemplateService
from app.modules.social.services.social_account_service import SocialAccountService
from app.modules.social.services.social_content_service import SocialContentService
from app.modules.social.services.social_sync_engine import SocialSyncEngine

admin_social_router = APIRouter(prefix="/social/admin", tags=["Social Aggregation & Admin"])


@admin_social_router.post(
    "/creators/register",
    response_model=CreatorResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_register_creator(
    payload: AdminCreatorRegister,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    creator = service.register_creator_with_accounts(payload)
    return creator


@admin_social_router.post(
    "/creators/{creator_id}/accounts",
    response_model=SocialAccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_creator_social_account(
    creator_id: uuid.UUID,
    payload: SocialAccountCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    account = service.add_social_account(creator_id, payload)
    return account


@admin_social_router.get(
    "/creators/{creator_id}/accounts",
    response_model=list[SocialAccountResponse],
)
def list_creator_social_accounts(
    creator_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.account_repo.get_by_creator(creator_id)


@admin_social_router.post(
    "/accounts/{account_id}/verify",
    response_model=SocialAccountResponse,
)
def verify_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.verify_social_account(account_id)


@admin_social_router.post(
    "/accounts/{account_id}/accept",
    response_model=SocialAccountResponse,
)
def accept_social_account(
    account_id: uuid.UUID,
    payload: SocialAccountAcceptPayload,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.accept_social_account(account_id, payload)


@admin_social_router.post(
    "/accounts/{account_id}/activate",
    response_model=SocialAccountResponse,
)
def activate_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.activate_social_account(account_id)


@admin_social_router.post(
    "/accounts/{account_id}/pause",
    response_model=SocialAccountResponse,
)
def pause_social_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.pause_social_account(account_id)


@admin_social_router.patch(
    "/accounts/{account_id}/settings",
    response_model=SocialAccountResponse,
)
def update_social_account_settings(
    account_id: uuid.UUID,
    payload: SocialAccountUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.update_account_settings(account_id, payload)


@admin_social_router.post(
    "/accounts/{account_id}/sync",
)
def sync_single_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialSyncEngine(db)
    return engine.sync_account(account_id)


@admin_social_router.post(
    "/sync-all",
)
def sync_all_accounts(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    engine = SocialSyncEngine(db)
    return engine.sync_all_active_accounts()


@admin_social_router.get(
    "/accounts/health",
)
def get_social_accounts_health(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialAccountService(db)
    return service.get_account_health_summary()


@admin_social_router.post(
    "/feed-templates",
    response_model=FeedTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_or_update_feed_template(
    payload: FeedTemplateCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = FeedTemplateService(db)
    return service.create_or_update_template(payload)


@admin_social_router.get(
    "/feed-templates",
    response_model=list[FeedTemplateResponse],
)
def list_feed_templates(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = FeedTemplateService(db)
    return service.list_templates()


@admin_social_router.patch(
    "/content/{content_id}/visibility",
)
def toggle_content_visibility(
    content_id: uuid.UUID,
    is_visible: bool = Query(...),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_admin),
) -> Any:
    service = SocialContentService(db)
    content = service.get_by_id(content_id)
    content.publication_status = "PUBLISHED" if is_visible else "HIDDEN"
    db.commit()
    return {"id": str(content.id), "publication_status": content.publication_status}
