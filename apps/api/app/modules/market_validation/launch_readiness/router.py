from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, AuthUser
from app.modules.market_validation.launch_readiness.schemas import LaunchReadinessCheck, LaunchReadinessResponse
from app.modules.market_validation.launch_readiness.service import LaunchReadinessService

router = APIRouter(prefix="/readiness", tags=["market-validation-readiness"])


@router.get("/{pilot_id}", response_model=LaunchReadinessResponse)
def get_latest_readiness(pilot_id: str, db: Session = Depends(get_db)):
    service = LaunchReadinessService(db)
    return service.get_latest_assessment(pilot_id)


@router.post("/{pilot_id}", response_model=LaunchReadinessResponse, status_code=status.HTTP_201_CREATED)
def assess_launch_readiness(
    pilot_id: str,
    check: LaunchReadinessCheck,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = LaunchReadinessService(db)
    return service.record_assessment(pilot_id, check)
