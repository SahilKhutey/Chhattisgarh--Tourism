from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.provider_feedback.schemas import (
    ProviderFeedbackCreate,
    ProviderFeedbackResponse,
    ProviderFeedbackListResponse,
)
from app.modules.market_validation.provider_feedback.service import ProviderFeedbackService

router = APIRouter(
    prefix="/provider-feedback",
    tags=["market-validation-provider-feedback"],
)

service = ProviderFeedbackService()


@router.post(
    "",
    response_model=ProviderFeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_feedback(
    payload: ProviderFeedbackCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.record_feedback(db, payload)


@router.get(
    "",
    response_model=ProviderFeedbackListResponse,
)
def list_feedback(
    provider_id: UUID | None = Query(default=None),
    journey: str | None = Query(default=None),
    sentiment: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_feedback(
        db,
        provider_id=provider_id,
        journey=journey,
        sentiment=sentiment,
        limit=limit,
        offset=offset,
    )
    return ProviderFeedbackListResponse(total=total, items=items)
