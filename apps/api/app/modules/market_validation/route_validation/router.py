from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.route_validation.schemas import (
    RouteValidationCreate,
    RouteValidationResponse,
    RouteValidationListResponse,
)
from app.modules.market_validation.route_validation.service import RouteValidationService

router = APIRouter(
    prefix="/routes",
    tags=["market-validation-route-validation"],
)

service = RouteValidationService()


@router.post(
    "/validate",
    response_model=RouteValidationResponse,
    status_code=status.HTTP_201_CREATED,
)
def validate_route(
    payload: RouteValidationCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.validate_and_record_route(db, payload)


@router.get(
    "/experiments",
    response_model=RouteValidationListResponse,
)
def list_route_experiments(
    origin: str | None = Query(default=None),
    destination: str | None = Query(default=None),
    feasibility: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_routes(
        db, origin=origin, destination=destination, feasibility=feasibility, limit=limit, offset=offset
    )
    return RouteValidationListResponse(total=total, items=items)
