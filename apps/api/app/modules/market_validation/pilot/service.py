from __future__ import annotations

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.pilot.models import ValidationPilot, PilotCohort
from app.modules.market_validation.pilot.repository import PilotRepository
from app.modules.market_validation.pilot.schemas import (
    PilotCreate,
    PilotUpdate,
    PilotCohortCreate,
    VALID_PILOT_STATUSES,
    PILOT_TRANSITIONS,
)


class PilotService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PilotRepository(db)

    def initialize_defaults(self) -> None:
        """Seed baseline Bastar Tribal Heritage pilot if empty."""
        existing = self.repo.list_pilots()
        if not existing:
            default_pilot = PilotCreate(
                name="Bastar Tribal Heritage & Craft Circuit Pilot",
                validation_decision_id="MV10-DECISION-GO-001",
                geography_scope={
                    "division": "Bastar",
                    "districts": ["Bastar", "Dantewada"],
                    "tourism_zone": "Chitrakote-Kanger-Valley",
                },
                consumer_segments=["EXPERIENTIAL_EXPLORERS", "ECO_CULTURAL_TRAVELERS"],
                provider_segments=["RURAL_HOMESTAYS", "LICENSED_TRIBAL_GUIDES", "COMMUNITY_CAMPS"],
                destination_ids=["chitrakote-falls", "tirathgarh-falls", "kanger-valley-caves", "dholkal-ganesh"],
                provider_ids=["bastar-homestay-01", "kanger-eco-guide-02", "dantewada-camp-03"],
                experience_ids=["dhokra-metal-craft-trail", "kanger-river-kayak", "gondi-village-feast"],
                minimum_sample=50,
                target_sample=200,
                budget_band="PILOT_TIER_1_INR_50K",
                launch_owner="PRODUCT_LEADER",
            )
            created = self.create_pilot(
                default_pilot,
                actor_id="system-init",
                actor_role="ADMIN",
                initial_status="ACTIVE",
            )
            created.start_date = datetime.now(timezone.utc)
            self.db.commit()

    def create_pilot(
        self,
        data: PilotCreate,
        actor_id: str = "system",
        actor_role: str = "ADMIN",
        initial_status: str = "DRAFT",
    ) -> ValidationPilot:
        # Rule (Section 2): MV10 is the decision authority. Do not create a pilot from a NO_GO decision.
        if "NO_GO" in data.validation_decision_id.upper() or "NO-GO" in data.validation_decision_id.upper():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot initiate pilot execution from a NO_GO validation decision. MV10 is the decision authority.",
            )

        pilot = self.repo.create_pilot(data, initial_status=initial_status)
        self.repo.record_audit(
            pilot_id=pilot.id,
            event_type="pilot_created",
            actor_id=actor_id,
            actor_role=actor_role,
            details={"name": pilot.name, "status": pilot.status},
        )
        return pilot

    def get_pilot(self, pilot_id: str) -> ValidationPilot:
        pilot = self.repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Validation pilot not found")
        return pilot

    def list_pilots(self, status: str | None = None, limit: int = 100, offset: int = 0) -> list[ValidationPilot]:
        self.initialize_defaults()
        return self.repo.list_pilots(status=status, limit=limit, offset=offset)

    def transition_status(
        self,
        pilot_id: str,
        target_status: str,
        actor_id: str,
        actor_role: str,
        expected_version: int | None = None,
    ) -> ValidationPilot:
        pilot = self.get_pilot(pilot_id)
        current = pilot.status

        if target_status not in VALID_PILOT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target status '{target_status}'. Allowed: {sorted(list(VALID_PILOT_STATUSES))}",
            )

        allowed_targets = PILOT_TRANSITIONS.get(current, set())
        if target_status not in allowed_targets:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Invalid pilot transition from {current} to {target_status}. Allowed next states: {sorted(list(allowed_targets))}",
            )

        update_dict: dict = {"status": target_status}
        if target_status == "ACTIVE" and not pilot.start_date:
            update_dict["start_date"] = datetime.now(timezone.utc)
        elif target_status in ("COMPLETED", "FAILED", "CANCELLED") and not pilot.end_date:
            update_dict["end_date"] = datetime.now(timezone.utc)

        updated = self.repo.update_pilot(pilot, update_dict, expected_version=expected_version)
        self.repo.record_audit(
            pilot_id=pilot.id,
            event_type=f"pilot_status_{target_status.lower()}",
            actor_id=actor_id,
            actor_role=actor_role,
            details={"from": current, "to": target_status, "version": updated.version},
        )
        return updated

    def pause_pilot(self, pilot_id: str, actor_id: str, actor_role: str, expected_version: int | None = None) -> ValidationPilot:
        return self.transition_status(pilot_id, "PAUSED", actor_id, actor_role, expected_version)

    def resume_pilot(self, pilot_id: str, actor_id: str, actor_role: str, expected_version: int | None = None) -> ValidationPilot:
        return self.transition_status(pilot_id, "ACTIVE", actor_id, actor_role, expected_version)

    def complete_pilot(self, pilot_id: str, actor_id: str, actor_role: str, expected_version: int | None = None) -> ValidationPilot:
        return self.transition_status(pilot_id, "COMPLETED", actor_id, actor_role, expected_version)

    def update_pilot(
        self,
        pilot_id: str,
        data: PilotUpdate,
        actor_id: str,
        actor_role: str,
        expected_version: int | None = None,
    ) -> ValidationPilot:
        pilot = self.get_pilot(pilot_id)

        update_data = data.model_dump(exclude_unset=True)
        target_status = update_data.pop("status", None)

        if update_data:
            pilot = self.repo.update_pilot(pilot, update_data, expected_version=expected_version)

        if target_status and target_status != pilot.status:
            pilot = self.transition_status(pilot.id, target_status, actor_id, actor_role, expected_version=pilot.version)

        return pilot

    def record_cohort(self, data: PilotCohortCreate) -> PilotCohort:
        self.get_pilot(data.pilot_id)
        return self.repo.create_cohort(data)

    def list_cohorts(self, pilot_id: str) -> list[PilotCohort]:
        return self.repo.list_cohorts(pilot_id)
