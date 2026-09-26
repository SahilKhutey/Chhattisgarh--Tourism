from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.discovery.schemas import (
    DiscoveryEventCreate,
    DiscoveryEventResponse,
    DiscoveryEventListResponse,
    ContentSearchQuery,
    ContentSearchResponse,
)
from app.modules.market_validation.discovery.service import DiscoveryService

router = APIRouter(
    prefix="/content/discovery",
    tags=["market-validation-discovery"],
)


@router.post(
    "/events",
    response_model=DiscoveryEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_discovery_event(
    payload: DiscoveryEventCreate,
    db: Session = Depends(get_db),
):
    # Discovery events can be reported from public client sessions
    service = DiscoveryService(db)
    return service.record_event(payload)


@router.get(
    "/events",
    response_model=DiscoveryEventListResponse,
)
def list_discovery_events(
    event_type: str | None = Query(default=None),
    discovery_source: str | None = Query(default=None),
    content_entry_id: str | None = Query(default=None),
    destination_id: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = DiscoveryService(db)
    total, items = service.list_events(
        event_type=event_type,
        discovery_source=discovery_source,
        content_entry_id=content_entry_id,
        destination_id=destination_id,
        limit=limit,
        offset=offset,
    )
    return {"total": total, "items": items}


@router.post(
    "/search",
    response_model=ContentSearchResponse,
)
def search_content(
    payload: ContentSearchQuery,
    db: Session = Depends(get_db),
):
    service = DiscoveryService(db)
    return service.search_content(
        query=payload.query,
        intent_category=payload.intent_category,
        region_id=payload.region_id,
        limit=payload.limit,
    )


@router.get(
    "/funnel",
)
def get_discovery_funnel(
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = DiscoveryService(db)
    return service.get_discovery_funnel()
