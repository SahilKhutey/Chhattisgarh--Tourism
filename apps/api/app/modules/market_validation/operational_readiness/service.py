from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.pilot.repository import PilotRepository
from app.modules.market_validation.operational_readiness.models import OperationalReadiness
from app.modules.market_validation.operational_readiness.repository import OperationalReadinessRepository
from app.modules.market_validation.operational_readiness.schemas import (
    OperationalReadinessUpdate,
    OperationalReadinessResponse,
)


class OperationalReadinessService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OperationalReadinessRepository(db)
        self.pilot_repo = PilotRepository(db)

    def initialize_defaults(self, pilot_id: str) -> OperationalReadiness:
        defaults = OperationalReadinessUpdate(
            support_capacity={
                "agents_count": 2,
                "coverage_hours": "08:00 - 20:00 IST",
                "max_concurrent_chats": 15,
                "current_utilization_pct": 35.0,
            },
            content_operations={
                "curators_count": 1,
                "turnaround_time_hours": 24,
                "verification_backlog": 3,
            },
            provider_operations={
                "field_liaisons": 1,
                "onboarding_time_days": 2.5,
                "dispute_sla_hours": 12,
            },
            technical_operations={
                "uptime_target_pct": 99.9,
                "current_uptime_pct": 99.95,
                "p95_latency_ms": 140,
            },
            incident_response={
                "on_call_rotation_defined": True,
                "severity_1_sla_minutes": 15,
                "simulated_drill_passed": True,
            },
            monitoring={
                "health_endpoints_active": True,
                "sentry_enabled": True,
                "db_connection_pool_alarm": True,
            },
            escalation={
                "primary_contact": "OPS_LEAD",
                "executive_sponsor": "FOUNDER",
            },
            founder_dependency_metrics={
                "total_weekly_tasks": 120,
                "founder_involved_tasks": 14,
                "manual_approval_dependencies": 2,
            },
            readiness_status="READY",
        )
        return self.repo.create_or_update(pilot_id, defaults, "READY")

    def get_operational_readiness(self, pilot_id: str) -> OperationalReadinessResponse:
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        readiness = self.repo.get_by_pilot(pilot_id)
        if not readiness:
            readiness = self.initialize_defaults(pilot_id)

        return self._format_response(readiness)

    def update_operational_readiness(
        self,
        pilot_id: str,
        data: OperationalReadinessUpdate,
    ) -> OperationalReadinessResponse:
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        # Founder intervention rate evaluation
        founder_metrics = data.founder_dependency_metrics or {}
        total = founder_metrics.get("total_weekly_tasks", 100)
        founder = founder_metrics.get("founder_involved_tasks", 10)
        rate = (founder / total) if total > 0 else 0.0

        target_status = data.readiness_status or ("READY" if rate <= 0.20 else "ATTENTION_REQUIRED")
        readiness = self.repo.create_or_update(pilot_id, data, target_status)
        return self._format_response(readiness)

    def _format_response(self, item: OperationalReadiness) -> OperationalReadinessResponse:
        founder = item.founder_dependency_metrics or {}
        total = founder.get("total_weekly_tasks", 100)
        invol = founder.get("founder_involved_tasks", 14)
        rate = round((invol / total) if total > 0 else 0.0, 3)

        resp = OperationalReadinessResponse.model_validate(item)
        resp.founder_intervention_rate = rate
        return resp
