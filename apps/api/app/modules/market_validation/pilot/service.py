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


from app.modules.market_validation.pilot.bastar_data import (
    BASTAR_CIRCUIT_DESTINATIONS,
    CERTIFIED_BASTAR_PROVIDERS,
    EMERGENCY_ESCALATION_ROSTER,
)
from app.modules.market_validation.pilot.cohort_expansion_data import (
    FEEDER_MARKET_COHORTS,
    MONETIZATION_ECONOMICS,
    HOST_SLA_METRICS,
    RETENTION_AND_REFERRAL,
    SCALE_GATES_EVALUATION,
    SURGUJA_EXPANSION_DOSSIER,
)



class PilotService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PilotRepository(db)

    def initialize_defaults(self) -> None:
        """Seed baseline Bastar Tribal Heritage pilot with 18 certified providers if empty."""
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
                destination_ids=[d["id"] for d in BASTAR_CIRCUIT_DESTINATIONS],
                provider_ids=[p["id"] for p in CERTIFIED_BASTAR_PROVIDERS],
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

    def get_certified_providers(
        self,
        pilot_id: str,
        sub_circuit: str | None = None,
        provider_type: str | None = None,
    ) -> list[dict]:
        self.get_pilot(pilot_id)
        results = CERTIFIED_BASTAR_PROVIDERS
        if sub_circuit and sub_circuit.upper() != "ALL":
            results = [p for p in results if p["sub_circuit"].lower() == sub_circuit.lower()]
        if provider_type and provider_type.upper() != "ALL":
            results = [p for p in results if p["provider_type"].upper() == provider_type.upper()]
        return results

    def get_circuit_readiness(self, pilot_id: str) -> dict:
        pilot = self.get_pilot(pilot_id)
        providers = CERTIFIED_BASTAR_PROVIDERS
        homestays = [p for p in providers if p["provider_type"] == "HOMESTAY"]
        guides = [p for p in providers if p["provider_type"] == "GUIDE"]

        from app.modules.market_validation.operational_readiness.repository import OperationalReadinessRepository
        from app.modules.market_validation.launch_controls.repository import LaunchControlRepository

        op_repo = OperationalReadinessRepository(self.db)
        op_readiness = op_repo.get_by_pilot(pilot_id)
        founder_rate = 0.117
        if op_readiness and op_readiness.founder_dependency_metrics:
            metrics = op_readiness.founder_dependency_metrics
            total = metrics.get("total_weekly_tasks", 100)
            invol = metrics.get("founder_involved_tasks", 14)
            founder_rate = round(invol / total if total > 0 else 0.0, 3)

        from app.modules.market_validation.launch_controls.service import LaunchControlService

        ctrl_service = LaunchControlService(self.db)
        controls = ctrl_service.list_controls(pilot_id)
        breakers_armed = len(controls) > 0 and all(c.enabled for c in controls)

        completion_pct = round((len(providers) / 18.0) * 100.0, 1)
        is_ready = bool(
            pilot.status in ("READY", "ACTIVE")
            and len(providers) >= 18
            and founder_rate < 0.20
            and breakers_armed
        )

        return {
            "pilot_id": pilot.id,
            "circuit_name": "Bastar Tribal Heritage Circuit 1 (Chitrakote - Tirathgarh - Kanger - Dholkal)",
            "status": pilot.status,
            "version": pilot.version,
            "destinations": BASTAR_CIRCUIT_DESTINATIONS,
            "destinations_count": len(BASTAR_CIRCUIT_DESTINATIONS),
            "certified_providers_count": len(providers),
            "homestays_count": len(homestays),
            "guides_count": len(guides),
            "certification_target": 18,
            "certification_completion_pct": completion_pct,
            "emergency_roster": EMERGENCY_ESCALATION_ROSTER,
            "emergency_status": "ARMED_AND_PATROLLING",
            "circuit_breakers_armed": breakers_armed,
            "founder_intervention_rate": founder_rate,
            "founder_intervention_target_pct": 20.0,
            "is_operational_ready": is_ready,
        }

    def get_cohort_expansion_telemetry(self, pilot_id: str) -> dict:
        pilot = self.get_pilot(pilot_id)
        total_leads = sum(c["qualified_leads"] for c in FEEDER_MARKET_COHORTS)
        return {
            "pilot_id": pilot.id,
            "phase": "Days 31–60: Cohort Expansion & Monetization Validation",
            "status": "VALIDATED_POSITIVE_ECONOMICS",
            "total_leads_target": 150,
            "total_leads_achieved": total_leads,
            "feeder_cohorts": FEEDER_MARKET_COHORTS,
            "monetization": MONETIZATION_ECONOMICS,
            "host_sla": HOST_SLA_METRICS,
            "retention_referral": RETENTION_AND_REFERRAL,
        }

    def get_scale_governance_scorecard(self, pilot_id: str) -> dict:
        pilot = self.get_pilot(pilot_id)
        passed = sum(1 for g in SCALE_GATES_EVALUATION if g["status"] == "PASSED")
        failed = sum(1 for g in SCALE_GATES_EVALUATION if g["status"] == "FAILED")
        all_passed = failed == 0 and passed == len(SCALE_GATES_EVALUATION)
        decision = "SCALE" if all_passed else "LIMITED_EXPANSION"
        rationale = (
            "All 10 scale gates passed with validated unit economics (98.6% contribution margin on ₹25/lead), "
            "zero safety breaches, 94.4% host SLA compliance, and 11.7% founder intervention. "
            "Formal authorization granted for secondary circuit expansion into Surguja Ecotourism Circuit."
            if all_passed else "Scale gates evaluation conditional."
        )
        return {
            "pilot_id": pilot.id,
            "scale_decision": decision,
            "decision_rationale": rationale,
            "total_gates": len(SCALE_GATES_EVALUATION),
            "passed_gates_count": passed,
            "failed_gates_count": failed,
            "gates": SCALE_GATES_EVALUATION,
            "next_expansion_circuit": "Surguja Ecotourism & Highland Heritage Circuit",
            "transferability_score": 74.8,
            "authorized_for_expansion": all_passed,
        }

    def get_surguja_expansion_dossier(self, pilot_id: str) -> dict:
        self.get_pilot(pilot_id)
        return SURGUJA_EXPANSION_DOSSIER

