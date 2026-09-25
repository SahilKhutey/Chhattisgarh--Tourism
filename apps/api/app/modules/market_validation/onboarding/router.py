from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.onboarding.schemas import (
    OnboardingStart,
    OnboardingStepUpdate,
    OnboardingComplete,
    OnboardingResponse,
    OnboardingListResponse,
)
from app.modules.market_validation.onboarding.service import OnboardingService

router = APIRouter(
    prefix="/onboarding",
    tags=["market-validation-onboarding"],
)

service = OnboardingService()


@router.post(
    "/{provider_id}/start",
    response_model=OnboardingResponse,
    status_code=status.HTTP_201_CREATED,
)
def start_onboarding(
    provider_id: UUID,
    payload: OnboardingStart | None = None,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.start_onboarding(db, provider_id, payload)


@router.get(
    "/{provider_id}",
    response_model=OnboardingResponse,
)
def get_onboarding(
    provider_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_by_provider_id(db, provider_id)


@router.patch(
    "/{provider_id}/step",
    response_model=OnboardingResponse,
)
def update_step(
    provider_id: UUID,
    payload: OnboardingStepUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_step(db, provider_id, payload)


@router.post(
    "/{provider_id}/complete",
    response_model=OnboardingResponse,
)
def complete_onboarding(
    provider_id: UUID,
    payload: OnboardingComplete = OnboardingComplete(),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.complete_onboarding(db, provider_id, payload)


@router.get(
    "",
    response_model=OnboardingListResponse,
)
def list_onboardings(
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_onboardings(db, status=status, limit=limit, offset=offset)
    return OnboardingListResponse(total=total, items=items)
