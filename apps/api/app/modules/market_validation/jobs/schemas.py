from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_JTBD_STATUSES = {
    "UNTESTED",
    "EMERGING",
    "SUPPORTED",
    "STRONGLY_SUPPORTED",
    "INCONCLUSIVE",
    "INVALIDATED",
}


class JTBDBase(BaseModel):
    jtbd_key: str
    title: str
    description: str
    status: str = "UNTESTED"
    total_interviews_evaluated: int = 0
    supporting_interviews_count: int = 0
    direct_behavior_count: int = 0
    observed_workaround_count: int = 0
    confidence_score: float = 0.0
    evidence_summary: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_status(cls, data: dict):
        if not isinstance(data, dict):
            return data
        stat = data.get("status", "UNTESTED")
        if stat not in VALID_JTBD_STATUSES:
            raise ValueError(f"Invalid status '{stat}'. Must be one of {sorted(VALID_JTBD_STATUSES)}")
        return data


class JTBDCreate(JTBDBase):
    pass


class JTBDUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    total_interviews_evaluated: int | None = None
    supporting_interviews_count: int | None = None
    direct_behavior_count: int | None = None
    observed_workaround_count: int | None = None
    confidence_score: float | None = None
    evidence_summary: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_status(cls, data: dict):
        if not isinstance(data, dict):
            return data
        stat = data.get("status")
        if stat is not None and stat not in VALID_JTBD_STATUSES:
            raise ValueError(f"Invalid status '{stat}'. Must be one of {sorted(VALID_JTBD_STATUSES)}")
        return data


class JTBDResponse(JTBDBase):
    id: UUID
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JTBDListResponse(BaseModel):
    total: int
    items: list[JTBDResponse]
