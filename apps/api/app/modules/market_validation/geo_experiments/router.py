from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.geo_experiments.schemas import (
    GeoExperimentCreate,
    GeoExperimentUpdate,
    GeoExperimentResponse,
    GeoExperimentListResponse,
    GeoObservationCreate,
    GeoObservationResponse,
    GeoObservationListResponse,
)
from app.modules.market_validation.geo_experiments.service import GeoExperimentService

router = APIRouter(
    prefix="/experiments",
    tags=["market-validation-geo-experiments"],
)

service = GeoExperimentService()


@router.post(
    "",
    response_model=GeoExperimentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_experiment(
    payload: GeoExperimentCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    exp = service.create_experiment(db, payload)
    return service.to_response(exp)


@router.get(
    "",
    response_model=GeoExperimentListResponse,
)
def list_experiments(
    hypothesis_key: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_experiments(
        db, hypothesis_key=hypothesis_key, status=status, limit=limit, offset=offset
    )
    return GeoExperimentListResponse(total=total, items=[service.to_response(e) for e in items])


@router.get(
    "/{experiment_id}",
    response_model=GeoExperimentResponse,
)
def get_experiment(
    experiment_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    exp = service.get_experiment(db, experiment_id)
    return service.to_response(exp)


@router.patch(
    "/{experiment_id}",
    response_model=GeoExperimentResponse,
)
def update_experiment(
    experiment_id: UUID,
    payload: GeoExperimentUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    exp = service.update_experiment(db, experiment_id, payload)
    return service.to_response(exp)


@router.post(
    "/observations",
    response_model=GeoObservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_observation(
    payload: GeoObservationCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.record_observation(db, payload)


@router.get(
    "/observations/list",
    response_model=GeoObservationListResponse,
)
def list_observations(
    task_id: str | None = Query(default=None),
    relationship_type: str | None = Query(default=None),
    successful: bool | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_observations(
        db,
        task_id=task_id,
        relationship_type=relationship_type,
        successful=successful,
        limit=limit,
        offset=offset,
    )
    return GeoObservationListResponse(total=total, items=items)
