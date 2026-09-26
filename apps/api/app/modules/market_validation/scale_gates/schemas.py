from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ScaleGateCreate(BaseModel):
    pilot_id: str
    gate_name: str
    requirement: str
    metric: str
    threshold: float
    actual_value: float = 0.0
    status: str = "PENDING"
    blocker: bool = True
    evidence_ids: list[str] = Field(default_factory=list)


class ScaleGateUpdate(BaseModel):
    actual_value: float | None = None
    status: str | None = None
    evidence_ids: list[str] | None = None


class ScaleGateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pilot_id: str
    gate_name: str
    requirement: str
    metric: str
    threshold: float
    actual_value: float
    status: str
    blocker: bool
    evidence_ids: list[str] | None = None
    evaluated_at: datetime


class ScaleDecisionResponse(BaseModel):
    pilot_id: str
    decision: str  # SCALE, LIMITED_EXPANSION, CONTINUE_PILOT, PIVOT, PAUSE, STOP
    rationale: str
    total_gates: int
    passed_gates: int
    failed_gates: int
    pending_gates: int
    critical_failures: list[str]
    evaluated_at: datetime
