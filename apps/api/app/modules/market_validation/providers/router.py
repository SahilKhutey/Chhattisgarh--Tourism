from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.providers.schemas import (
    ProviderCreate,
    ProviderUpdate,
    ProviderResponse,
    ProviderListResponse,
    ProviderResearchCreate,
    ProviderResearchResponse,
)
from app.modules.market_validation.providers.service import ProviderService

router = APIRouter(
    prefix="/providers",
    tags=["market-validation-providers"],
)

service = ProviderService()


@router.post(
    "",
    response_model=ProviderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_provider(
    payload: ProviderCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_provider(db, payload)


@router.get(
    "",
    response_model=ProviderListResponse,
)
def list_providers(
    provider_type: str | None = Query(default=None),
    segment: str | None = Query(default=None),
    geography: str | None = Query(default=None),
    verification_status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_providers(
        db,
        provider_type=provider_type,
        segment=segment,
        geography=geography,
        verification_status=verification_status,
        limit=limit,
        offset=offset,
    )
    return ProviderListResponse(total=total, items=items)


@router.get(
    "/{provider_id}",
    response_model=ProviderResponse,
)
def get_provider(
    provider_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_provider(db, provider_id)


@router.patch(
    "/{provider_id}",
    response_model=ProviderResponse,
)
def update_provider(
    provider_id: UUID,
    payload: ProviderUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_provider(db, provider_id, payload)


@router.post(
    "/{provider_id}/research",
    response_model=ProviderResearchResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_research(
    provider_id: UUID,
    payload: ProviderResearchCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.record_research(db, provider_id, payload)


@router.get(
    "/{provider_id}/research",
    response_model=list[ProviderResearchResponse],
)
def list_research(
    provider_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_provider_research(db, provider_id)
