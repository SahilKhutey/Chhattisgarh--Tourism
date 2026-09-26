from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, AuthUser
from app.modules.market_validation.operational_readiness.schemas import (
    OperationalReadinessUpdate,
    OperationalReadinessResponse,
)
from app.modules.market_validation.operational_readiness.service import OperationalReadinessService

router = APIRouter(prefix="/operational-readiness", tags=["market-validation-operational-readiness"])


@router.get("/{pilot_id}", response_model=OperationalReadinessResponse)
def get_operational_readiness(pilot_id: str, db: Session = Depends(get_db)):
    service = OperationalReadinessService(db)
    return service.get_operational_readiness(pilot_id)


@router.put("/{pilot_id}", response_model=OperationalReadinessResponse)
def update_operational_readiness(
    pilot_id: str,
    data: OperationalReadinessUpdate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = OperationalReadinessService(db)
    return service.update_operational_readiness(pilot_id, data)
