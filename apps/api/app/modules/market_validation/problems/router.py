from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.problems.schemas import (
    ProblemCreate,
    ProblemUpdate,
    ProblemResponse,
    ProblemListResponse,
)
from app.modules.market_validation.problems.service import ProblemService

router = APIRouter(
    prefix="/problems",
    tags=["market-validation-problems"],
)

service = ProblemService()


@router.post(
    "",
    response_model=ProblemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_problem(
    payload: ProblemCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_problem(db, payload)


@router.get(
    "",
    response_model=ProblemListResponse,
)
def list_problems(
    journey_stage: str | None = Query(default=None),
    cluster_tag: str | None = Query(default=None),
    related_jtbd: str | None = Query(default=None),
    min_pain_score: int | None = Query(default=None, ge=1, le=625),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_problems(
        db,
        journey_stage=journey_stage,
        cluster_tag=cluster_tag,
        related_jtbd=related_jtbd,
        min_pain_score=min_pain_score,
        limit=limit,
        offset=offset,
    )
    return ProblemListResponse(total=total, items=items)


@router.get(
    "/{problem_id}",
    response_model=ProblemResponse,
)
def get_problem(
    problem_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_problem(db, problem_id)


@router.patch(
    "/{problem_id}",
    response_model=ProblemResponse,
)
def update_problem(
    problem_id: UUID,
    payload: ProblemUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_problem(db, problem_id, payload)
