from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_SEGMENTS = {
    "LOCAL_RESIDENT",
    "CG_TRAVELER",
    "INTERSTATE_TRAVELER",
    "INTERNATIONAL_TRAVELER",
    "SOLO_TRAVELER",
    "COUPLE",
    "FAMILY",
    "GROUP",
    "BACKPACKER",
    "ADVENTURE_TRAVELER",
    "CULTURAL_TRAVELER",
    "NATURE_TRAVELER",
    "PILGRIMAGE_TRAVELER",
    "WILDLIFE_TRAVELER",
}

DISALLOWED_FIELDS = {
    "aadhaar",
    "pan",
    "phone",
    "mobile",
    "email",
    "full_address",
    "address",
    "passport",
}


class ParticipantBase(BaseModel):
    segment: str
    traveler_type: list[str] = Field(default_factory=list)
    origin_region: str
    age_band: str
    travel_frequency: str
    cg_visit_history: str
    digital_behavior: dict | list | None = None
    planning_method: str
    preferred_language: str = "en"
    accessibility_needs: str | None = None
    consent_status: bool = True
    recruitment_source: str

    @model_validator(mode="before")
    @classmethod
    def check_disallowed_and_validate(cls, data: dict):
        if not isinstance(data, dict):
            return data
        for k in data.keys():
            if k.lower() in DISALLOWED_FIELDS:
                raise ValueError(f"Sensitive field '{k}' is strictly disallowed in research participant records.")
        segment = data.get("segment")
        if segment and segment not in VALID_SEGMENTS:
            raise ValueError(f"Invalid segment '{segment}'. Must be one of {sorted(VALID_SEGMENTS)}")
        consent = data.get("consent_status", True)
        if not consent:
            raise ValueError("Research participant must provide explicit informed consent (consent_status must be True).")
        return data


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantUpdate(BaseModel):
    segment: str | None = None
    traveler_type: list[str] | None = None
    origin_region: str | None = None
    age_band: str | None = None
    travel_frequency: str | None = None
    cg_visit_history: str | None = None
    digital_behavior: dict | list | None = None
    planning_method: str | None = None
    preferred_language: str | None = None
    accessibility_needs: str | None = None
    consent_status: bool | None = None
    recruitment_source: str | None = None

    @model_validator(mode="before")
    @classmethod
    def check_disallowed(cls, data: dict):
        if not isinstance(data, dict):
            return data
        for k in data.keys():
            if k.lower() in DISALLOWED_FIELDS:
                raise ValueError(f"Sensitive field '{k}' is strictly disallowed.")
        segment = data.get("segment")
        if segment is not None and segment not in VALID_SEGMENTS:
            raise ValueError(f"Invalid segment '{segment}'.")
        return data


class ParticipantResponse(ParticipantBase):
    id: UUID
    anonymous_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipantListResponse(BaseModel):
    total: int
    items: list[ParticipantResponse]
