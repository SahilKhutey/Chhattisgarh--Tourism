from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.geographic.schemas import (
    GeoDestinationCreate,
    GeoDestinationUpdate,
    GeoDestinationResponse,
    GeoDestinationListResponse,
)
from app.modules.market_validation.geographic.service import GeoService

router = APIRouter(
    prefix="/destinations",
    tags=["market-validation-geography"],
)

service = GeoService()


@router.post(
    "",
    response_model=GeoDestinationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_destination(
    payload: GeoDestinationCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_destination(db, payload)


@router.get(
    "",
    response_model=GeoDestinationListResponse,
)
def list_destinations(
    region_id: str | None = Query(default=None),
    district: str | None = Query(default=None),
    tourism_type: str | None = Query(default=None),
    validation_status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_destinations(
        db,
        region_id=region_id,
        district=district,
        tourism_type=tourism_type,
        validation_status=validation_status,
        limit=limit,
        offset=offset,
    )
    return GeoDestinationListResponse(total=total, items=items)


@router.get(
    "/{destination_id}",
    response_model=GeoDestinationResponse,
)
def get_destination(
    destination_id: str,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_destination(db, destination_id)


@router.patch(
    "/{destination_id}",
    response_model=GeoDestinationResponse,
)
def update_destination(
    destination_id: str,
    payload: GeoDestinationUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_destination(db, destination_id, payload)
