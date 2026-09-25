from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.jobs.schemas import (
    JTBDCreate,
    JTBDUpdate,
    JTBDResponse,
    JTBDListResponse,
)
from app.modules.market_validation.jobs.service import JTBDService

router = APIRouter(
    prefix="/jobs",
    tags=["market-validation-jobs"],
)

service = JTBDService()


@router.post(
    "",
    response_model=JTBDResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_jtbd(
    payload: JTBDCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_jtbd(db, payload)


@router.get(
    "",
    response_model=JTBDListResponse,
)
def list_jtbds(
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_jtbds(db, status=status_filter, limit=limit, offset=offset)
    return JTBDListResponse(total=total, items=items)


@router.get(
    "/{jtbd_id}",
    response_model=JTBDResponse,
)
def get_jtbd(
    jtbd_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_jtbd(db, jtbd_id)


@router.patch(
    "/{jtbd_id}",
    response_model=JTBDResponse,
)
def update_jtbd(
    jtbd_id: UUID,
    payload: JTBDUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_jtbd(db, jtbd_id, payload)
