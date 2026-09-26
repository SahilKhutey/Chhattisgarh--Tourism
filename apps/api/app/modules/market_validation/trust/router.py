from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.trust.schemas import (
    ContentTrustUpdate,
    ContentTrustResponse,
)
from app.modules.market_validation.trust.service import ContentTrustService

router = APIRouter(
    prefix="/content/trust",
    tags=["market-validation-content-trust"],
)


@router.get(
    "/{content_entry_id}",
    response_model=ContentTrustResponse,
)
def get_content_trust(
    content_entry_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentTrustService(db)
    return service.get_or_compute_trust(content_entry_id)


@router.patch(
    "/{content_entry_id}",
    response_model=ContentTrustResponse,
)
def update_content_trust(
    content_entry_id: UUID,
    payload: ContentTrustUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentTrustService(db)
    return service.update_trust(content_entry_id, payload)
