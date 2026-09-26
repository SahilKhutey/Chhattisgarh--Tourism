from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LaunchReadinessCheck(BaseModel):
    product_ready: bool = False
    content_ready: bool = False
    geography_ready: bool = False
    supply_ready: bool = False
    consumer_ready: bool = False
    transaction_ready: bool = False
    analytics_ready: bool = False
    support_ready: bool = False
    security_ready: bool = False
    privacy_ready: bool = False
    safety_ready: bool = False
    operational_ready: bool = False
    blockers: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class LaunchReadinessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pilot_id: str
    product_ready: bool
    content_ready: bool
    geography_ready: bool
    supply_ready: bool
    consumer_ready: bool
    transaction_ready: bool
    analytics_ready: bool
    support_ready: bool
    security_ready: bool
    privacy_ready: bool
    safety_ready: bool
    operational_ready: bool
    passed_gates_count: int = 0
    total_gates_count: int = 12
    readiness_percentage: float = 0.0
    blockers: list[str] | None = None
    warnings: list[str] | None = None
    overall_status: str
    assessed_at: datetime
