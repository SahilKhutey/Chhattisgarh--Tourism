from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, require_pilot_approver, AuthUser
from app.modules.market_validation.scale_gates.schemas import (
    ScaleGateUpdate,
    ScaleGateResponse,
    ScaleDecisionResponse,
)
from app.modules.market_validation.scale_gates.service import ScaleGateService

router = APIRouter(prefix="/scale-gates", tags=["market-validation-scale-gates"])


@router.get("/{pilot_id}", response_model=list[ScaleGateResponse])
def list_scale_gates(pilot_id: str, db: Session = Depends(get_db)):
    service = ScaleGateService(db)
    return service.list_gates(pilot_id)


@router.put("/gate/{gate_id}", response_model=ScaleGateResponse)
def update_scale_gate(
    gate_id: str,
    data: ScaleGateUpdate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = ScaleGateService(db)
    return service.update_gate(gate_id, data)


@router.get("/{pilot_id}/decision", response_model=ScaleDecisionResponse)
def get_scale_decision(
    pilot_id: str,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_approver),
):
    service = ScaleGateService(db)
    return service.evaluate_scale_decision(pilot_id)
