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
