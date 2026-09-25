from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.geo_relationships.schemas import (
    GeoRelationshipCreate,
    GeoRelationshipUpdate,
    GeoRelationshipResponse,
    GeoRelationshipListResponse,
    NearbyPlacesResponse,
)
from app.modules.market_validation.geo_relationships.service import GeoRelationshipService

router = APIRouter(
    prefix="/relationships",
    tags=["market-validation-geo-relationships"],
)

service = GeoRelationshipService()


@router.post(
    "",
    response_model=GeoRelationshipResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_relationship(
    payload: GeoRelationshipCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_relationship(db, payload)


@router.get(
    "",
    response_model=GeoRelationshipListResponse,
)
def list_relationships(
    source_id: str | None = Query(default=None),
    target_id: str | None = Query(default=None),
    relationship_type: str | None = Query(default=None),
    validation_status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_relationships(
        db,
        source_id=source_id,
        target_id=target_id,
        relationship_type=relationship_type,
        validation_status=validation_status,
        limit=limit,
        offset=offset,
    )
    return GeoRelationshipListResponse(total=total, items=items)


@router.get(
    "/nearby",
    response_model=NearbyPlacesResponse,
)
def get_nearby_places(
    destination_id: str = Query(..., description="Source destination ID"),
    radius_km: float = Query(default=50.0, ge=1.0, le=500.0),
    relationship_type: str | None = Query(default=None),
    sort_by: str = Query(default="relevance", pattern="^(relevance|distance)$"),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_nearby_places(
        db,
        destination_id=destination_id,
        radius_km=radius_km,
        relationship_type=relationship_type,
        sort_by=sort_by,
        limit=limit,
    )


@router.get(
    "/{relationship_id}",
    response_model=GeoRelationshipResponse,
)
def get_relationship(
    relationship_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_relationship(db, relationship_id)


@router.patch(
    "/{relationship_id}",
    response_model=GeoRelationshipResponse,
)
def update_relationship(
    relationship_id: UUID,
    payload: GeoRelationshipUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_relationship(db, relationship_id, payload)
