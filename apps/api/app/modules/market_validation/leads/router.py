from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.leads.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadQualify,
    LeadResponseRecord,
    LeadBookingRecord,
    LeadResponse,
    LeadListResponse,
)
from app.modules.market_validation.leads.service import LeadService

router = APIRouter(
    prefix="/leads",
    tags=["market-validation-leads"],
)

service = LeadService()


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_lead(db, payload)


@router.get(
    "",
    response_model=LeadListResponse,
)
def list_leads(
    provider_id: UUID | None = Query(default=None),
    status: str | None = Query(default=None),
    qualified: bool | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_leads(
        db,
        provider_id=provider_id,
        status=status,
        qualified=qualified,
        limit=limit,
        offset=offset,
    )
    return LeadListResponse(total=total, items=items)


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
)
def get_lead(
    lead_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_lead(db, lead_id)


@router.patch(
    "/{lead_id}",
    response_model=LeadResponse,
)
def update_lead(
    lead_id: UUID,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_lead(db, lead_id, payload)


@router.post(
    "/{lead_id}/qualify",
    response_model=LeadResponse,
)
def qualify_lead(
    lead_id: UUID,
    payload: LeadQualify = LeadQualify(),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.qualify_lead(db, lead_id, payload)


@router.post(
    "/{lead_id}/response",
    response_model=LeadResponse,
)
def record_response(
    lead_id: UUID,
    payload: LeadResponseRecord = LeadResponseRecord(),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.record_response(db, lead_id, payload)


@router.post(
    "/{lead_id}/booking",
    response_model=LeadResponse,
)
def record_booking(
    lead_id: UUID,
    payload: LeadBookingRecord = LeadBookingRecord(),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.record_booking(db, lead_id, payload)
