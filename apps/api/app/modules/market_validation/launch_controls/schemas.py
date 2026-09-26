from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LaunchControlCreate(BaseModel):
    pilot_id: str
    control_type: str  # TRAFFIC_LIMIT, BOOKING_LIMIT, CIRCUIT_BREAKER, SAFETY_DISABLE
    name: str
    enabled: bool = True
    threshold: float
    current_value: float = 0.0
    action: str  # THROTTLE, HALT_BOOKINGS, PAUSE_PILOT, ALERT
    owner: str = "SYSTEM"


class LaunchControlUpdate(BaseModel):
    enabled: bool | None = None
    threshold: float | None = None
    current_value: float | None = None
    action: str | None = None


class LaunchControlResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pilot_id: str
    control_type: str
    name: str
    enabled: bool
    threshold: float
    current_value: float
    action: str
    owner: str
    triggered: bool = False
    created_at: datetime
    updated_at: datetime
