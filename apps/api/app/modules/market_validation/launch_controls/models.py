from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, String
from app.core.database import Base


class LaunchControl(Base):
    __tablename__ = "launch_controls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pilot_id = Column(String(36), nullable=False, index=True)
    control_type = Column(String(50), nullable=False, index=True)  # TRAFFIC_LIMIT, BOOKING_LIMIT, CIRCUIT_BREAKER, SAFETY_DISABLE
    name = Column(String(100), nullable=False)
    enabled = Column(Boolean, nullable=False, default=True)
    threshold = Column(Float, nullable=False, default=0.0)
    current_value = Column(Float, nullable=False, default=0.0)
    action = Column(String(100), nullable=False)  # THROTTLE, HALT_BOOKINGS, PAUSE_PILOT, ALERT
    owner = Column(String(100), nullable=False, default="SYSTEM")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
