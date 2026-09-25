from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.validation.schemas import (
    ValidationActionRequest,
    ValidationRecordResponse,
    ValidationListResponse,
)
from app.modules.market_validation.validation.service import ValidationService

router = APIRouter(
    prefix="/validation",
    tags=["market-validation-decisions"],
)

service = ValidationService()


@router.get(
    "",
    response_model=ValidationListResponse,
)
def list_validations(
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_validations(db, status_filter=status_filter, limit=limit, offset=offset)
    return ValidationListResponse(total=total, items=items)


@router.post(
    "/{jtbd_id}/support",
    response_model=ValidationRecordResponse,
)
def support_jtbd(
    jtbd_id: UUID,
    payload: ValidationActionRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.support_jtbd(db, jtbd_id, payload)


@router.post(
    "/{jtbd_id}/invalidate",
    response_model=ValidationRecordResponse,
)
def invalidate_jtbd(
    jtbd_id: UUID,
    payload: ValidationActionRequest,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.invalidate_jtbd(db, jtbd_id, payload)
