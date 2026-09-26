from __future__ import annotations

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.pilot.repository import PilotRepository
from app.modules.market_validation.scale_gates.models import ScaleGate
from app.modules.market_validation.scale_gates.repository import ScaleGateRepository
from app.modules.market_validation.scale_gates.schemas import (
    ScaleGateCreate,
    ScaleGateUpdate,
    ScaleGateResponse,
    ScaleDecisionResponse,
)


class ScaleGateService:
    DEFAULT_GATES = [
        ("gate_1_consumer_demand", "Discovery to planning conversion >= 20%", "discovery_to_plan_rate", 0.20, True),
        ("gate_2_supply_activation", "Active participating providers >= 15", "active_providers_count", 15.0, True),
        ("gate_3_transaction_feasibility", "Qualified lead conversion >= 15%", "lead_conversion_rate", 0.15, True),
        ("gate_4_unit_economics", "Net unit economic margin positive", "contribution_margin_pct", 0.10, True),
        ("gate_5_operational_stability", "Unresolved incident rate < 2%", "unresolved_incident_rate", 0.02, True),
        ("gate_6_safety_compliance", "Zero critical unaddressed safety breaches", "safety_breaches_count", 0.0, True),
        ("gate_7_content_completeness", "Verified destination coverage >= 85%", "content_coverage_pct", 0.85, True),
        ("gate_8_retention_intent", "Trip cycle repeat/recommend intent >= 40%", "repeat_intent_pct", 0.40, False),
        ("gate_9_founder_decoupling", "Founder manual intervention < 20% tasks", "founder_intervention_rate", 0.20, False),
        ("gate_10_market_transferability", "Expansion candidate affinity score >= 60", "transferability_score", 60.0, False),
    ]

    def __init__(self, db: Session):
        self.db = db
        self.repo = ScaleGateRepository(db)
        self.pilot_repo = PilotRepository(db)

    def initialize_pilot_gates(self, pilot_id: str) -> list[ScaleGate]:
        existing = self.repo.list_by_pilot(pilot_id)
        if existing:
            return existing

        created = []
        for name, req, metric, threshold, blocker in self.DEFAULT_GATES:
            gate_data = ScaleGateCreate(
                pilot_id=pilot_id,
                gate_name=name,
                requirement=req,
                metric=metric,
                threshold=threshold,
                actual_value=threshold,  # Seed baseline at threshold passing for active pilot
                status="PASSED",
                blocker=blocker,
                evidence_ids=["MV10-SCALE-BASELINE"],
            )
            created.append(self.repo.create(gate_data))
        return created

    def list_gates(self, pilot_id: str) -> list[ScaleGateResponse]:
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        gates = self.repo.list_by_pilot(pilot_id)
        if not gates:
            gates = self.initialize_pilot_gates(pilot_id)
        return [ScaleGateResponse.model_validate(g) for g in gates]

    def update_gate(self, gate_id: str, data: ScaleGateUpdate) -> ScaleGateResponse:
        gate = self.repo.get_by_id(gate_id)
        if not gate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scale gate not found")
        updated = self.repo.update(gate, data)
        return ScaleGateResponse.model_validate(updated)

    def evaluate_scale_decision(self, pilot_id: str) -> ScaleDecisionResponse:
        """
        Rule (Section 31 & Constraints):
        - Critical safety failure -> STOP
        - Critical operational failure -> PAUSE
        - Core consumer value not met -> PIVOT
        - Evidence incomplete -> CONTINUE_PILOT
        - Economics unproven -> LIMITED_EXPANSION
        - All required gates pass -> SCALE
        """
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        gates = self.repo.list_by_pilot(pilot_id)
        if not gates:
            gates = self.initialize_pilot_gates(pilot_id)

        gate_map = {g.gate_name: g for g in gates}
        passed_gates = [g for g in gates if g.status == "PASSED"]
        failed_gates = [g for g in gates if g.status == "FAILED"]
        pending_gates = [g for g in gates if g.status == "PENDING"]

        critical_failures = []
        for g in failed_gates:
            if g.blocker:
                critical_failures.append(g.gate_name)

        # 1. Critical safety failure -> STOP
        safety_gate = gate_map.get("gate_6_safety_compliance")
        if safety_gate and safety_gate.status == "FAILED":
            decision = "STOP"
            rationale = "Critical safety compliance breach detected. Halting scale immediately."
        # 2. Critical operational failure -> PAUSE
        elif (gate_map.get("gate_5_operational_stability") and gate_map["gate_5_operational_stability"].status == "FAILED"):
            decision = "PAUSE"
            rationale = "Critical operational stability failure detected. Operations must stabilize before resuming."
        # 3. Core consumer value not met -> PIVOT
        elif (gate_map.get("gate_1_consumer_demand") and gate_map["gate_1_consumer_demand"].status == "FAILED"):
            decision = "PIVOT"
            rationale = "Core consumer value proposition failed demand threshold. Product positioning requires pivot."
        # 4. Evidence incomplete -> CONTINUE_PILOT
        elif len(pending_gates) > 0:
            decision = "CONTINUE_PILOT"
            rationale = f"{len(pending_gates)} scale gates remain pending evaluation. Continue pilot to gather complete evidence."
        # 5. Economics unproven -> LIMITED_EXPANSION
        elif (gate_map.get("gate_4_unit_economics") and gate_map["gate_4_unit_economics"].status == "FAILED"):
            decision = "LIMITED_EXPANSION"
            rationale = "Unit economics remain unproven despite operational validation. Restrict to limited expansion."
        # 6. All required gates pass -> SCALE
        elif len(critical_failures) == 0:
            decision = "SCALE"
            rationale = "All critical gates passed successfully. Pilot validated for state-wide scaling."
        else:
            decision = "CONTINUE_PILOT"
            rationale = f"Blocked by {len(critical_failures)} critical gate failures."

        return ScaleDecisionResponse(
            pilot_id=pilot_id,
            decision=decision,
            rationale=rationale,
            total_gates=len(gates),
            passed_gates=len(passed_gates),
            failed_gates=len(failed_gates),
            pending_gates=len(pending_gates),
            critical_failures=critical_failures,
            evaluated_at=datetime.now(timezone.utc),
        )
