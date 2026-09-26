from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class OperationalReadinessUpdate(BaseModel):
    support_capacity: dict = Field(default_factory=dict)
    content_operations: dict = Field(default_factory=dict)
    provider_operations: dict = Field(default_factory=dict)
    technical_operations: dict = Field(default_factory=dict)
    incident_response: dict = Field(default_factory=dict)
    monitoring: dict = Field(default_factory=dict)
    escalation: dict = Field(default_factory=dict)
    founder_dependency_metrics: dict = Field(default_factory=dict)
    readiness_status: str | None = None


class OperationalReadinessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pilot_id: str
    support_capacity: dict | None = None
    content_operations: dict | None = None
    provider_operations: dict | None = None
    technical_operations: dict | None = None
    incident_response: dict | None = None
    monitoring: dict | None = None
    escalation: dict | None = None
    founder_dependency_metrics: dict | None = None
    readiness_status: str
    founder_intervention_rate: float = 0.0
    assessed_at: datetime
