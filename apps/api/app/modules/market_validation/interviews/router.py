from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.interviews.schemas import (
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
    InterviewListResponse,
)
from app.modules.market_validation.interviews.service import InterviewService

router = APIRouter(
    prefix="/interviews",
    tags=["market-validation-interviews"],
)

service = InterviewService()


@router.post(
    "",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    payload: InterviewCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_interview(db, payload)


@router.get(
    "",
    response_model=InterviewListResponse,
)
def list_interviews(
    participant_id: UUID | None = Query(default=None),
    transcript_status: str | None = Query(default=None),
    destination: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_interviews(
        db,
        participant_id=participant_id,
        transcript_status=transcript_status,
        destination=destination,
        limit=limit,
        offset=offset,
    )
    return InterviewListResponse(total=total, items=items)


@router.get(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def get_interview(
    interview_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_interview(db, interview_id)


@router.patch(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def update_interview(
    interview_id: UUID,
    payload: InterviewUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_interview(db, interview_id, payload)
