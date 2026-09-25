from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator


VALID_ONBOARDING_STATUSES = {"STARTED", "IN_PROGRESS", "COMPLETED", "ABANDONED"}


class OnboardingStart(BaseModel):
    questions_asked: list[str] | dict | None = None


class OnboardingStepUpdate(BaseModel):
    step: int = Field(ge=1, le=7)
    required_fields_completed: bool | None = None
    questions_asked: list[str] | dict | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_step(cls, data: dict):
        if isinstance(data, dict):
            step = data.get("step")
            if step is not None and (step < 1 or step > 7):
                raise ValueError("Step must be between 1 and 7")
        return data


class OnboardingComplete(BaseModel):
    required_fields_completed: bool = True
    activate_provider: bool = True


class OnboardingResponse(BaseModel):
    id: UUID
    provider_id: UUID
    current_step: int
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    completion_rate: float
    required_fields_completed: bool
    questions_asked: list[str] | dict | None = None
    time_to_onboard_seconds: int | None = None

    model_config = ConfigDict(from_attributes=True)


class OnboardingListResponse(BaseModel):
    total: int
    items: list[OnboardingResponse]
