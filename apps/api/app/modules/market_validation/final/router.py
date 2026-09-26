from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, require_pilot_approver, AuthUser
from app.modules.market_validation.final.schemas import (
    EvidenceSnapshotResponse,
    DecisionResponse,
    GateEvaluationResult,
    NinetyDayPlanItem,
)
from app.modules.market_validation.final.service import FinalService

router = APIRouter(prefix="/final", tags=["market-validation-final"])


@router.get("", response_model=DecisionResponse)
def get_final_overview(db: Session = Depends(get_db)):
    service = FinalService(db)
    return service.get_or_evaluate_decision()


@router.get("/evidence", response_model=EvidenceSnapshotResponse)
def get_final_evidence_snapshot(db: Session = Depends(get_db)):
    service = FinalService(db)
    return service.get_or_create_snapshot()


@router.get("/gates", response_model=list[GateEvaluationResult])
def get_final_gates(db: Session = Depends(get_db)):
    service = FinalService(db)
    return service.evaluate_gates()


@router.get("/risks", response_model=dict[str, Any])
def get_final_risks_and_unknowns(db: Session = Depends(get_db)):
    service = FinalService(db)
    return service.get_risks_and_contradictions()


@router.get("/90-day-plan", response_model=list[NinetyDayPlanItem])
def get_90_day_execution_plan(db: Session = Depends(get_db)):
    service = FinalService(db)
    return service.get_90_day_plan()


@router.post("/evaluate", response_model=DecisionResponse)
def evaluate_decision_endpoint(
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_approver),
):
    service = FinalService(db)
    return service.get_or_evaluate_decision(approved_by=str(user.id))
