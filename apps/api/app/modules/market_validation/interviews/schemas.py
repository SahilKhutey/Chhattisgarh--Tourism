from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_INTERVIEW_STATES = {
    "PLANNED",
    "SCHEDULED",
    "CONDUCTED",
    "TRANSCRIBED",
    "ANALYZED",
    "ARCHIVED",
}


class InterviewBase(BaseModel):
    participant_id: UUID
    research_project: str = "CG_TOURISM_MV2"
    interviewer: str
    date: datetime
    duration_minutes: int = Field(ge=1, le=480)
    travel_context: str | None = None
    destination: str | None = None
    transcript_status: str = "PLANNED"
    recording_consent: bool = False
    summary: str | None = None
    key_findings: list[str] | dict | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_interview_fields(cls, data: dict):
        if not isinstance(data, dict):
            return data
        status = data.get("transcript_status", "PLANNED")
        if status and status not in VALID_INTERVIEW_STATES:
            raise ValueError(f"Invalid transcript_status '{status}'. Must be one of {sorted(VALID_INTERVIEW_STATES)}")
        return data


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    research_project: str | None = None
    interviewer: str | None = None
    date: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=1, le=480)
    travel_context: str | None = None
    destination: str | None = None
    transcript_status: str | None = None
    recording_consent: bool | None = None
    summary: str | None = None
    key_findings: list[str] | dict | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_status(cls, data: dict):
        if not isinstance(data, dict):
            return data
        status = data.get("transcript_status")
        if status is not None and status not in VALID_INTERVIEW_STATES:
            raise ValueError(f"Invalid transcript_status '{status}'. Must be one of {sorted(VALID_INTERVIEW_STATES)}")
        return data


class InterviewResponse(InterviewBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewListResponse(BaseModel):
    total: int
    items: list[InterviewResponse]
