from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.participants.schemas import (
    ParticipantCreate,
    ParticipantUpdate,
    ParticipantResponse,
    ParticipantListResponse,
)
from app.modules.market_validation.participants.service import ParticipantService

router = APIRouter(
    prefix="/participants",
    tags=["market-validation-participants"],
)

service = ParticipantService()


@router.post(
    "",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_participant(
    payload: ParticipantCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_participant(db, payload)


@router.get(
    "",
    response_model=ParticipantListResponse,
)
def list_participants(
    segment: str | None = Query(default=None),
    origin_region: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_participants(
        db, segment=segment, origin_region=origin_region, limit=limit, offset=offset
    )
    return ParticipantListResponse(total=total, items=items)


@router.get(
    "/{participant_id}",
    response_model=ParticipantResponse,
)
def get_participant(
    participant_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_participant(db, participant_id)


@router.patch(
    "/{participant_id}",
    response_model=ParticipantResponse,
)
def update_participant(
    participant_id: UUID,
    payload: ParticipantUpdate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.update_participant(db, participant_id, payload)
