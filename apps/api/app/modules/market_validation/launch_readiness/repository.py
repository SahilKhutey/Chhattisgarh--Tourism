from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.launch_readiness.models import LaunchReadinessAssessment
from app.modules.market_validation.launch_readiness.schemas import LaunchReadinessCheck


class LaunchReadinessRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, pilot_id: str, check: LaunchReadinessCheck, overall_status: str) -> LaunchReadinessAssessment:
        assessment = LaunchReadinessAssessment(
            pilot_id=pilot_id,
            product_ready=check.product_ready,
            content_ready=check.content_ready,
            geography_ready=check.geography_ready,
            supply_ready=check.supply_ready,
            consumer_ready=check.consumer_ready,
            transaction_ready=check.transaction_ready,
            analytics_ready=check.analytics_ready,
            support_ready=check.support_ready,
            security_ready=check.security_ready,
            privacy_ready=check.privacy_ready,
            safety_ready=check.safety_ready,
            operational_ready=check.operational_ready,
            blockers=check.blockers,
            warnings=check.warnings,
            overall_status=overall_status,
        )
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_latest_by_pilot(self, pilot_id: str) -> LaunchReadinessAssessment | None:
        return (
            self.db.query(LaunchReadinessAssessment)
            .filter(LaunchReadinessAssessment.pilot_id == pilot_id)
            .order_by(LaunchReadinessAssessment.assessed_at.desc())
            .first()
        )

    def list_by_pilot(self, pilot_id: str) -> list[LaunchReadinessAssessment]:
        return (
            self.db.query(LaunchReadinessAssessment)
            .filter(LaunchReadinessAssessment.pilot_id == pilot_id)
            .order_by(LaunchReadinessAssessment.assessed_at.desc())
            .all()
        )
