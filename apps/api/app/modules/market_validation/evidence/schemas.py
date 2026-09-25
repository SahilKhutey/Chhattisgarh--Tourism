from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_EVIDENCE_TYPES = {
    "DIRECT_BEHAVIOR",
    "OBSERVED_WORKAROUND",
    "REPORTED_PAIN",
    "USER_STATEMENT",
    "REPORTED_DESIRE",
    "RESEARCHER_INFERENCE",
}


class EvidenceBase(BaseModel):
    participant_id: UUID
    interview_id: UUID
    problem_id: UUID | None = None
    jtbd_id: str | None = None
    evidence_type: str
    observation: str
    source: str
    timestamp: datetime | None = None
    researcher_confidence: int = Field(ge=1, le=5, default=3)

    @model_validator(mode="before")
    @classmethod
    def validate_fields(cls, data: dict):
        if not isinstance(data, dict):
            return data
        e_type = data.get("evidence_type")
        if not e_type or e_type not in VALID_EVIDENCE_TYPES:
            raise ValueError(f"Invalid evidence_type '{e_type}'. Must be one of {sorted(VALID_EVIDENCE_TYPES)}")
        src = data.get("source")
        if not src or not src.strip():
            raise ValueError("Evidence source is strictly required (cannot be empty).")
        return data


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceResponse(EvidenceBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceListResponse(BaseModel):
    total: int
    items: list[EvidenceResponse]
