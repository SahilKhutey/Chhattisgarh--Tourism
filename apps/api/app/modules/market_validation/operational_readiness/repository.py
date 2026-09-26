from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.operational_readiness.models import OperationalReadiness
from app.modules.market_validation.operational_readiness.schemas import OperationalReadinessUpdate


class OperationalReadinessRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_or_update(
        self,
        pilot_id: str,
        data: OperationalReadinessUpdate,
        status: str,
    ) -> OperationalReadiness:
        existing = (
            self.db.query(OperationalReadiness)
            .filter(OperationalReadiness.pilot_id == pilot_id)
            .first()
        )
        if not existing:
            existing = OperationalReadiness(pilot_id=pilot_id)
            self.db.add(existing)

        existing.support_capacity = data.support_capacity
        existing.content_operations = data.content_operations
        existing.provider_operations = data.provider_operations
        existing.technical_operations = data.technical_operations
        existing.incident_response = data.incident_response
        existing.monitoring = data.monitoring
        existing.escalation = data.escalation
        existing.founder_dependency_metrics = data.founder_dependency_metrics
        existing.readiness_status = status

        self.db.commit()
        self.db.refresh(existing)
        return existing

    def get_by_pilot(self, pilot_id: str) -> OperationalReadiness | None:
        return (
            self.db.query(OperationalReadiness)
            .filter(OperationalReadiness.pilot_id == pilot_id)
            .first()
        )
