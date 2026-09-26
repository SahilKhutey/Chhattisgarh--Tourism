from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.modules.market_validation.launch_controls.models import LaunchControl
from app.modules.market_validation.launch_controls.schemas import LaunchControlCreate, LaunchControlUpdate


class LaunchControlRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: LaunchControlCreate) -> LaunchControl:
        control = LaunchControl(
            pilot_id=data.pilot_id,
            control_type=data.control_type,
            name=data.name,
            enabled=data.enabled,
            threshold=data.threshold,
            current_value=data.current_value,
            action=data.action,
            owner=data.owner,
        )
        self.db.add(control)
        self.db.commit()
        self.db.refresh(control)
        return control

    def get_by_id(self, control_id: str) -> LaunchControl | None:
        return self.db.query(LaunchControl).filter(LaunchControl.id == control_id).first()

    def list_by_pilot(self, pilot_id: str) -> list[LaunchControl]:
        return self.db.query(LaunchControl).filter(LaunchControl.pilot_id == pilot_id).order_by(LaunchControl.created_at.asc()).all()

    def update(self, control: LaunchControl, data: LaunchControlUpdate) -> LaunchControl:
        if data.enabled is not None:
            control.enabled = data.enabled
        if data.threshold is not None:
            control.threshold = data.threshold
        if data.current_value is not None:
            control.current_value = data.current_value
        if data.action is not None:
            control.action = data.action
        control.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(control)
        return control
