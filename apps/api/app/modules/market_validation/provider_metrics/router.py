from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.provider_metrics.schemas import (
    ProviderMetricUpdate,
    ProviderMetricResponse,
    ProviderFunnelAnalysis,
    ProviderValueAnalysis,
    ProviderResponseAnalysis,
)
from app.modules.market_validation.provider_metrics.service import ProviderMetricService

router = APIRouter(
    prefix="/provider-metrics",
    tags=["market-validation-provider-metrics"],
)

service = ProviderMetricService()


@router.get(
    "/{provider_id}",
    response_model=ProviderMetricResponse,
)
def get_provider_metric(
    provider_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    metric = service.get_or_create_metric(db, provider_id)
    return service.to_response(metric)


@router.patch(
    "/{provider_id}",
    response_model=ProviderMetricResponse,
)
def update_provider_metric(
    provider_id: UUID,
    payload: ProviderMetricUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    metric = service.update_metric(db, provider_id, payload)
    return service.to_response(metric)


@router.post(
    "/{provider_id}/recalculate",
    response_model=ProviderMetricResponse,
)
def recalculate_provider_metric(
    provider_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    metric = service.recalculate_provider_metric(db, provider_id)
    return service.to_response(metric)
