from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.admin.dependencies import AdminUser
from app.modules.market_validation.auth import require_market_researcher
from app.modules.market_validation.evidence.schemas import (
    EvidenceCreate,
    EvidenceResponse,
    EvidenceListResponse,
)
from app.modules.market_validation.evidence.service import EvidenceService

router = APIRouter(
    prefix="/evidence",
    tags=["market-validation-evidence"],
)

service = EvidenceService()


@router.post(
    "",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_evidence(
    payload: EvidenceCreate,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.create_evidence(db, payload)


@router.get(
    "",
    response_model=EvidenceListResponse,
)
def list_evidence(
    problem_id: UUID | None = Query(default=None),
    interview_id: UUID | None = Query(default=None),
    participant_id: UUID | None = Query(default=None),
    jtbd_id: str | None = Query(default=None),
    evidence_type: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    total, items = service.list_evidence(
        db,
        problem_id=problem_id,
        interview_id=interview_id,
        participant_id=participant_id,
        jtbd_id=jtbd_id,
        evidence_type=evidence_type,
        limit=limit,
        offset=offset,
    )
    return EvidenceListResponse(total=total, items=items)


@router.get(
    "/{evidence_id}",
    response_model=EvidenceResponse,
)
def get_evidence(
    evidence_id: UUID,
    db: Session = Depends(get_db),
    user: AdminUser = Depends(require_market_researcher),
):
    return service.get_evidence(db, evidence_id)
