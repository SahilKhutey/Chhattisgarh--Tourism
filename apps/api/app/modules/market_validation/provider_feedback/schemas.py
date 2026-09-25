from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_JOURNEYS = {
    "ONBOARDING",
    "LISTING_CREATION",
    "LEAD_RECEIPT",
    "TOURIST_COMMUNICATION",
    "BOOKING_MANAGEMENT",
    "PAYMENT",
    "GENERAL",
}

VALID_SENTIMENTS = {
    "POSITIVE",
    "NEUTRAL",
    "NEGATIVE",
    "FRUSTRATED",
    "DELIGHTED",
}


class ProviderFeedbackCreate(BaseModel):
    provider_id: UUID
    journey: str
    feature: str
    sentiment: str = "NEUTRAL"
    problem: str | None = None
    value: str | None = None
    difficulty: int = Field(default=3, ge=1, le=5)
    willingness_to_continue: bool = True
    willingness_to_pay: str | None = None
    free_text: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_fields(cls, data: dict):
        if isinstance(data, dict):
            j = data.get("journey")
            if j and j not in VALID_JOURNEYS:
                raise ValueError(f"Invalid journey '{j}'. Must be one of {sorted(VALID_JOURNEYS)}")
            s = data.get("sentiment")
            if s and s not in VALID_SENTIMENTS:
                raise ValueError(f"Invalid sentiment '{s}'. Must be one of {sorted(VALID_SENTIMENTS)}")
        return data


class ProviderFeedbackResponse(ProviderFeedbackCreate):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProviderFeedbackListResponse(BaseModel):
    total: int
    items: list[ProviderFeedbackResponse]
