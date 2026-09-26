from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.launch_readiness.models import LaunchReadinessAssessment
from app.modules.market_validation.launch_readiness.repository import LaunchReadinessRepository
from app.modules.market_validation.launch_readiness.schemas import LaunchReadinessCheck, LaunchReadinessResponse
from app.modules.market_validation.pilot.repository import PilotRepository


class LaunchReadinessService:
    GATE_NAMES = [
        "product_ready",
        "content_ready",
        "geography_ready",
        "supply_ready",
        "consumer_ready",
        "transaction_ready",
        "analytics_ready",
        "support_ready",
        "security_ready",
        "privacy_ready",
        "safety_ready",
        "operational_ready",
    ]

    def __init__(self, db: Session):
        self.db = db
        self.repo = LaunchReadinessRepository(db)
        self.pilot_repo = PilotRepository(db)

    def evaluate_readiness(self, check: LaunchReadinessCheck) -> tuple[str, list[str]]:
        blockers = list(check.blockers)
        passed = 0
        for gate in self.GATE_NAMES:
            if getattr(check, gate):
                passed += 1
            else:
                gate_name = gate.replace("_", " ").title()
                if gate in ("safety_ready", "security_ready", "privacy_ready", "product_ready"):
                    blockers.append(f"Critical gate not satisfied: {gate_name}")

        # If any blocker exists or any critical gate fails, status is BLOCKED
        if blockers:
            return "BLOCKED", blockers
        if passed == len(self.GATE_NAMES):
            return "READY", []
        return "NOT_READY", []

    def record_assessment(self, pilot_id: str, check: LaunchReadinessCheck) -> LaunchReadinessResponse:
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        overall_status, evaluated_blockers = self.evaluate_readiness(check)
        check.blockers = evaluated_blockers

        assessment = self.repo.create(pilot_id, check, overall_status)
        return self._format_response(assessment)

    def get_latest_assessment(self, pilot_id: str) -> LaunchReadinessResponse:
        assessment = self.repo.get_latest_by_pilot(pilot_id)
        if not assessment:
            # Default baseline assessment
            default_check = LaunchReadinessCheck(
                product_ready=True,
                content_ready=True,
                geography_ready=True,
                supply_ready=True,
                consumer_ready=True,
                transaction_ready=True,
                analytics_ready=True,
                support_ready=True,
                security_ready=True,
                privacy_ready=True,
                safety_ready=True,
                operational_ready=True,
                blockers=[],
                warnings=["Pre-launch check: verify local guide emergency numbers before day 1"],
            )
            assessment = self.repo.create(pilot_id, default_check, "READY")

        return self._format_response(assessment)

    def _format_response(self, assessment: LaunchReadinessAssessment) -> LaunchReadinessResponse:
        passed = sum(1 for g in self.GATE_NAMES if getattr(assessment, g, False))
        total = len(self.GATE_NAMES)
        percentage = round((passed / total) * 100.0, 1)

        resp = LaunchReadinessResponse.model_validate(assessment)
        resp.passed_gates_count = passed
        resp.total_gates_count = total
        resp.readiness_percentage = percentage
        return resp
