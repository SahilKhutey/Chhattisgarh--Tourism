from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, AuthUser
from app.modules.market_validation.launch_controls.schemas import (
    LaunchControlUpdate,
    LaunchControlResponse,
    CircuitBreakerEvaluationRequest,
    CircuitBreakerEvaluationResponse,
)
from app.modules.market_validation.launch_controls.service import LaunchControlService

router = APIRouter(prefix="/launch-controls", tags=["market-validation-launch-controls"])


@router.get("/{pilot_id}", response_model=list[LaunchControlResponse])
def list_launch_controls(pilot_id: str, db: Session = Depends(get_db)):
    service = LaunchControlService(db)
    return service.list_controls(pilot_id)


@router.put("/control/{control_id}", response_model=LaunchControlResponse)
def update_launch_control(
    control_id: str,
    data: LaunchControlUpdate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = LaunchControlService(db)
    return service.update_control(control_id, data)


@router.post("/{pilot_id}/evaluate", response_model=CircuitBreakerEvaluationResponse)
def evaluate_circuit_breakers(
    pilot_id: str,
    request: CircuitBreakerEvaluationRequest | None = None,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = LaunchControlService(db)
    return service.evaluate_circuit_breakers(pilot_id, request)


@router.post("/{pilot_id}/simulate-incident", response_model=CircuitBreakerEvaluationResponse)
def simulate_incident(
    pilot_id: str,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = LaunchControlService(db)
    return service.simulate_emergency_incident(pilot_id)
