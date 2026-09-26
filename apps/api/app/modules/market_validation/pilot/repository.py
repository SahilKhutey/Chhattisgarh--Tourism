from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.pilot.models import ValidationPilot, PilotCohort, PilotAuditEvent
from app.modules.market_validation.pilot.schemas import PilotCreate, PilotUpdate, PilotCohortCreate


class PilotRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_pilot(self, data: PilotCreate, initial_status: str = "DRAFT") -> ValidationPilot:
        scope_dict = data.product_scope.model_dump() if hasattr(data.product_scope, "model_dump") else data.product_scope
        pilot = ValidationPilot(
            name=data.name,
            validation_decision_id=data.validation_decision_id,
            status=initial_status,
            version=1,
            geography_scope=data.geography_scope,
            consumer_segments=data.consumer_segments,
            provider_segments=data.provider_segments,
            destination_ids=data.destination_ids,
            provider_ids=data.provider_ids,
            experience_ids=data.experience_ids,
            product_scope=scope_dict,
            success_metrics=data.success_metrics,
            failure_metrics=data.failure_metrics,
            minimum_sample=data.minimum_sample,
            target_sample=data.target_sample,
            budget_band=data.budget_band,
            launch_owner=data.launch_owner,
        )
        self.db.add(pilot)
        self.db.commit()
        self.db.refresh(pilot)
        return pilot

    def get_pilot(self, pilot_id: str) -> ValidationPilot | None:
        return self.db.query(ValidationPilot).filter(ValidationPilot.id == pilot_id).first()

    def list_pilots(
        self,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[ValidationPilot]:
        query = self.db.query(ValidationPilot)
        if status:
            query = query.filter(ValidationPilot.status == status)
        return query.order_by(ValidationPilot.created_at.desc()).offset(offset).limit(limit).all()

    def update_pilot(
        self,
        pilot: ValidationPilot,
        update_data: dict,
        expected_version: int | None = None,
    ) -> ValidationPilot:
        # Optimistic locking check (Section 44)
        if expected_version is not None and pilot.version != expected_version:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Optimistic lock conflict: expected version {expected_version}, but entity is at version {pilot.version}",
            )

        for k, v in update_data.items():
            if v is not None and hasattr(pilot, k):
                setattr(pilot, k, v)

        pilot.version += 1
        self.db.commit()
        self.db.refresh(pilot)
        return pilot

    def record_audit(
        self,
        pilot_id: str,
        event_type: str,
        actor_id: str,
        actor_role: str,
        details: dict | None = None,
    ) -> PilotAuditEvent:
        audit = PilotAuditEvent(
            pilot_id=pilot_id,
            event_type=event_type,
            actor_id=actor_id,
            actor_role=actor_role,
            details=details,
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)
        return audit

    def create_cohort(self, data: PilotCohortCreate) -> PilotCohort:
        cohort = PilotCohort(
            pilot_id=data.pilot_id,
            cohort_name=data.cohort_name,
            acquisition_channel=data.acquisition_channel,
            consumer_segment=data.consumer_segment,
            geography=data.geography,
            language=data.language,
            device=data.device,
            users=data.users,
            activated_users=data.activated_users,
            planners=data.planners,
            leads=data.leads,
            bookings=data.bookings,
            completed_experiences=data.completed_experiences,
            returning_users=data.returning_users,
        )
        self.db.add(cohort)
        self.db.commit()
        self.db.refresh(cohort)
        return cohort

    def list_cohorts(self, pilot_id: str) -> list[PilotCohort]:
        return self.db.query(PilotCohort).filter(PilotCohort.pilot_id == pilot_id).order_by(PilotCohort.created_at.desc()).all()
