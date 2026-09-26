from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session
from app.modules.market_validation.final.models import MarketValidationDecision
from app.modules.market_validation.final.repository import FinalRepository
from app.modules.market_validation.final.aggregator import EvidenceAggregator
from app.modules.market_validation.final.gate_engine import FinalGateEngine
from app.modules.market_validation.final.risk_engine import FinalRiskEngine
from app.modules.market_validation.final.decision_engine import FinalDecisionEngine
from app.modules.market_validation.final.ninety_day_plan import NinetyDayPlanService
from app.modules.market_validation.final.schemas import (
    EvidenceSnapshotResponse,
    DecisionResponse,
    GateEvaluationResult,
    NinetyDayPlanItem,
)


class FinalService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FinalRepository(db)
        self.aggregator = EvidenceAggregator(db)
        self.gate_engine = FinalGateEngine()
        self.risk_engine = FinalRiskEngine()
        self.decision_engine = FinalDecisionEngine()
        self.plan_service = NinetyDayPlanService()

    def get_or_create_snapshot(self) -> EvidenceSnapshotResponse:
        snapshot = self.repo.get_latest_snapshot()
        if not snapshot:
            snapshot = self.aggregator.aggregate_full_stack()
            snapshot = self.repo.save_snapshot(snapshot)
        return EvidenceSnapshotResponse.model_validate(snapshot)

    def evaluate_gates(self) -> list[GateEvaluationResult]:
        return self.gate_engine.evaluate_gates()

    def get_risks_and_contradictions(self) -> dict[str, Any]:
        snapshot = self.get_or_create_snapshot()
        contradictions = self.risk_engine.detect_contradictions(snapshot.model_dump())
        unknowns = self.risk_engine.get_unknowns()
        return {
            "contradictions": contradictions,
            "unknowns": unknowns,
        }

    def get_or_evaluate_decision(self, approved_by: str = "EXECUTIVE_COMMITTEE") -> DecisionResponse:
        decision = self.repo.get_latest_decision()
        if not decision:
            snapshot = self.get_or_create_snapshot()
            gates = self.evaluate_gates()
            rc = self.get_risks_and_contradictions()

            dec, rationale, conf = self.decision_engine.evaluate_decision(
                gates=gates,
                contradictions=rc["contradictions"],
            )

            decision = MarketValidationDecision(
                version=1,
                decision=dec,
                rationale=rationale,
                evidence_snapshot_id=snapshot.id,
                policy_version="1.0.0",
                gate_snapshot={g.gate_id: g.status for g in gates},
                risk_snapshot={"total_contradictions": len(rc["contradictions"])},
                contradiction_snapshot=rc["contradictions"],
                unknowns_snapshot=rc["unknowns"],
                recommendation_scope={
                    "approved_pilot": "Bastar Tribal Heritage & Craft Circuit",
                    "scale_path": "CONTROLLED_PILOT_THEN_REGIONAL_EXPANSION",
                },
                confidence=conf,
                approved_by=approved_by,
            )
            decision = self.repo.save_decision(decision)

        return DecisionResponse.model_validate(decision)

    def get_90_day_plan(self) -> list[NinetyDayPlanItem]:
        return self.plan_service.generate_plan()
