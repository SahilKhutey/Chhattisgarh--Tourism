from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.listings.schemas import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    ListingListResponse,
)
from app.modules.market_validation.listings.service import ListingService

router = APIRouter(
    prefix="/listings",
    tags=["market-validation-listings"],
)

service = ListingService()


@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_listing(db, payload)


@router.get(
    "",
    response_model=ListingListResponse,
)
def list_listings(
    provider_id: UUID | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_listings(
        db,
        provider_id=provider_id,
        status=status,
        limit=limit,
        offset=offset,
    )
    return ListingListResponse(total=total, items=items)


@router.get(
    "/{listing_id}",
    response_model=ListingResponse,
)
def get_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_listing(db, listing_id)


@router.patch(
    "/{listing_id}",
    response_model=ListingResponse,
)
def update_listing(
    listing_id: UUID,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_listing(db, listing_id, payload)


@router.post(
    "/{listing_id}/publish",
    response_model=ListingResponse,
)
def publish_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.publish_listing(db, listing_id)
