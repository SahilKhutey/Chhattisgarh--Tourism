from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.pilot.repository import PilotRepository
from app.modules.market_validation.launch_controls.models import LaunchControl
from app.modules.market_validation.launch_controls.repository import LaunchControlRepository
from app.modules.market_validation.launch_controls.schemas import (
    LaunchControlCreate,
    LaunchControlUpdate,
    LaunchControlResponse,
    CircuitBreakerEvaluationRequest,
    CircuitBreakerEvaluationResponse,
)


class LaunchControlService:
    DEFAULT_CONTROLS = [
        ("TRAFFIC_LIMIT", "Max Daily Active Travelers", 500.0, 120.0, "THROTTLE"),
        ("BOOKING_LIMIT", "Max Open Pending Leads per Provider", 10.0, 2.0, "HALT_BOOKINGS"),
        ("CIRCUIT_BREAKER", "Max Provider Response Failure Rate %", 30.0, 12.0, "ALERT"),
        ("SAFETY_DISABLE", "Critical Unaddressed Safety Incidents", 1.0, 0.0, "PAUSE_PILOT"),
    ]

    def __init__(self, db: Session):
        self.db = db
        self.repo = LaunchControlRepository(db)
        self.pilot_repo = PilotRepository(db)

    def initialize_pilot_controls(self, pilot_id: str) -> list[LaunchControl]:
        existing = self.repo.list_by_pilot(pilot_id)
        if existing:
            return existing

        created = []
        for c_type, name, threshold, cur_val, action in self.DEFAULT_CONTROLS:
            ctrl = LaunchControlCreate(
                pilot_id=pilot_id,
                control_type=c_type,
                name=name,
                enabled=True,
                threshold=threshold,
                current_value=cur_val,
                action=action,
                owner="SYSTEM",
            )
            created.append(self.repo.create(ctrl))
        return created

    def list_controls(self, pilot_id: str) -> list[LaunchControlResponse]:
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        controls = self.repo.list_by_pilot(pilot_id)
        if not controls:
            controls = self.initialize_pilot_controls(pilot_id)

        responses = []
        for c in controls:
            resp = LaunchControlResponse.model_validate(c)
            # A control is triggered if enabled and current_value >= threshold
            resp.triggered = bool(c.enabled and c.current_value >= c.threshold)
            responses.append(resp)
        return responses

    def update_control(self, control_id: str, data: LaunchControlUpdate) -> LaunchControlResponse:
        control = self.repo.get_by_id(control_id)
        if not control:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Launch control not found")

        updated = self.repo.update(control, data)
        resp = LaunchControlResponse.model_validate(updated)
        resp.triggered = bool(updated.enabled and updated.current_value >= updated.threshold)
        return resp

    def evaluate_circuit_breakers(
        self,
        pilot_id: str,
        request: CircuitBreakerEvaluationRequest | None = None,
    ) -> CircuitBreakerEvaluationResponse:
        pilot = self.pilot_repo.get_pilot(pilot_id)
        if not pilot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pilot not found")

        controls = self.repo.list_by_pilot(pilot_id)
        if not controls:
            controls = self.initialize_pilot_controls(pilot_id)

        # Apply any incoming telemetry overrides to the control state
        ctrl_map = {c.control_type: c for c in controls}
        if request:
            if request.daily_active_travelers is not None and "TRAFFIC_LIMIT" in ctrl_map:
                ctrl_map["TRAFFIC_LIMIT"].current_value = request.daily_active_travelers
            if request.max_open_leads_per_host is not None and "BOOKING_LIMIT" in ctrl_map:
                ctrl_map["BOOKING_LIMIT"].current_value = request.max_open_leads_per_host
            if request.provider_response_failure_rate is not None and "CIRCUIT_BREAKER" in ctrl_map:
                ctrl_map["CIRCUIT_BREAKER"].current_value = request.provider_response_failure_rate
            if request.critical_safety_incidents is not None and "SAFETY_DISABLE" in ctrl_map:
                ctrl_map["SAFETY_DISABLE"].current_value = request.critical_safety_incidents
            self.db.commit()

        actions_triggered: list[str] = []
        control_responses: list[LaunchControlResponse] = []

        for c in controls:
            resp = LaunchControlResponse.model_validate(c)
            resp.triggered = bool(c.enabled and c.current_value >= c.threshold)
            if resp.triggered:
                actions_triggered.append(c.action)
            control_responses.append(resp)

        # Execute automated action: Critical Safety Incident Killswitch
        from app.modules.market_validation.pilot.service import PilotService
        pilot_service = PilotService(self.db)

        if "PAUSE_PILOT" in actions_triggered and pilot.status == "ACTIVE":
            pilot = pilot_service.pause_pilot(
                pilot_id=pilot.id,
                actor_id="CIRCUIT_BREAKER_SAFETY_KILLSWITCH",
                actor_role="SYSTEM",
            )

        if "PAUSE_PILOT" in actions_triggered:
            status_desc = "PAUSED_CRITICAL_SAFETY"
        elif "HALT_BOOKINGS" in actions_triggered:
            status_desc = "BOOKINGS_HALTED"
        elif "THROTTLE" in actions_triggered:
            status_desc = "THROTTLED"
        elif "ALERT" in actions_triggered:
            status_desc = "ALERTS_TRIGGERED"
        else:
            status_desc = "NORMAL"

        from datetime import datetime, timezone
        return CircuitBreakerEvaluationResponse(
            pilot_id=pilot.id,
            status=status_desc,
            pilot_status=pilot.status,
            actions_triggered=actions_triggered,
            controls=control_responses,
            evaluated_at=datetime.now(timezone.utc),
        )

    def simulate_emergency_incident(
        self,
        pilot_id: str,
        description: str = "Critical canyon flash flood warning near Chitrakote",
    ) -> CircuitBreakerEvaluationResponse:
        """Inject a critical safety incident into Bastar Circuit telemetry, triggering killswitch."""
        return self.evaluate_circuit_breakers(
            pilot_id,
            request=CircuitBreakerEvaluationRequest(critical_safety_incidents=1.0),
        )
