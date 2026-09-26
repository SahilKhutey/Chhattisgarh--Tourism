from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_SOURCE_TYPES = {
    "OFFICIAL",
    "GOVERNMENT",
    "PROVIDER",
    "FIELD_OBSERVATION",
    "LOCAL_COMMUNITY",
    "RESEARCH",
    "CREATOR",
    "USER_GENERATED",
    "OTHER",
}

VALID_EVIDENCE_STATUSES = {
    "UNVERIFIED",
    "VERIFIED",
    "STALE",
    "CONTRADICTED",
    "REJECTED",
}


class ContentEvidenceBase(BaseModel):
    content_entry_id: UUID
    claim: str
    field_name: str | None = None
    source_type: str
    source_reference: str | None = None
    observed_at: datetime | None = None
    verified_at: datetime | None = None
    verifier: str | None = None
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    status: str = "UNVERIFIED"

    @model_validator(mode="before")
    @classmethod
    def validate_evidence(cls, data: dict):
        if isinstance(data, dict):
            stype = data.get("source_type")
            if stype and stype not in VALID_SOURCE_TYPES:
                raise ValueError(f"Invalid source_type '{stype}'. Must be one of {sorted(VALID_SOURCE_TYPES)}")
            estatus = data.get("status")
            if estatus and estatus not in VALID_EVIDENCE_STATUSES:
                raise ValueError(f"Invalid status '{estatus}'. Must be one of {sorted(VALID_EVIDENCE_STATUSES)}")
            claim = data.get("claim")
            if not claim or not str(claim).strip():
                raise ValueError("claim is required and cannot be empty.")
            if not stype:
                raise ValueError("source_type is required.")
        return data


class ContentEvidenceCreate(ContentEvidenceBase):
    pass


class ContentEvidenceUpdate(BaseModel):
    claim: str | None = None
    field_name: str | None = None
    source_type: str | None = None
    source_reference: str | None = None
    verified_at: datetime | None = None
    verifier: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    status: str | None = None


class ContentEvidenceResponse(ContentEvidenceBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentEvidenceListResponse(BaseModel):
    total: int
    items: list[ContentEvidenceResponse]
