from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ValidationActionRequest(BaseModel):
    rationale: str
    evidence_summary: str | None = None
    direct_behavior_count: int | None = None
    supporting_interviews_count: int | None = None


class ValidationRecordResponse(BaseModel):
    id: UUID
    jtbd_key: str
    title: str
    status: str
    total_interviews_evaluated: int
    supporting_interviews_count: int
    direct_behavior_count: int
    confidence_score: float
    evidence_summary: str | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ValidationListResponse(BaseModel):
    total: int
    items: list[ValidationRecordResponse]
