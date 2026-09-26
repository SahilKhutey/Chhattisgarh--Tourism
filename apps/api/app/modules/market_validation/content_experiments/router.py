from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.content_experiments.schemas import (
    ContentExperimentCreate,
    ContentExperimentUpdate,
    ContentExperimentResponse,
    ContentExperimentListResponse,
    AssignmentRequest,
    AssignmentResponse,
)
from app.modules.market_validation.content_experiments.service import ContentExperimentService

router = APIRouter(
    prefix="/content/experiments",
    tags=["market-validation-content-experiments"],
)


@router.post(
    "",
    response_model=ContentExperimentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_experiment(
    payload: ContentExperimentCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentExperimentService(db)
    return service.create_experiment(payload)


@router.get(
    "",
    response_model=ContentExperimentListResponse,
)
def list_experiments(
    status: str | None = Query(default=None),
    hypothesis_key: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentExperimentService(db)
    total, items = service.list_experiments(status=status, hypothesis_key=hypothesis_key, limit=limit, offset=offset)
    return {"total": total, "items": items}


@router.get(
    "/{exp_id}",
    response_model=ContentExperimentResponse,
)
def get_experiment(
    exp_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentExperimentService(db)
    return service.get_experiment(exp_id)


@router.patch(
    "/{exp_id}",
    response_model=ContentExperimentResponse,
)
def update_experiment(
    exp_id: UUID,
    payload: ContentExperimentUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    service = ContentExperimentService(db)
    return service.update_experiment(exp_id, payload)


@router.post(
    "/{exp_id}/assign",
    response_model=AssignmentResponse,
)
def assign_user_to_experiment(
    exp_id: UUID,
    payload: AssignmentRequest,
    db: Session = Depends(get_db),
):
    service = ContentExperimentService(db)
    return service.assign_user(exp_id, payload.anonymous_user_id)
