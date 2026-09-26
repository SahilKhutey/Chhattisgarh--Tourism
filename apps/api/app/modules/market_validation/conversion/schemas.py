from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

CONVERSION_STAGES = {
    "CONTACT",
    "QUALIFIED",
    "BOOKING_INTENT",
    "BOOKED",
    "COMPLETED",
}


class ConversionCreate(BaseModel):
    lead_id: str
    booking_intent_id: str | None = None
    booking_id: str | None = None
    provider_id: str
    consumer_id: str | None = None
    conversion_stage: str  # CONTACT, QUALIFIED, BOOKING_INTENT, BOOKED, COMPLETED
    value: float = 0.0
    currency: str = "INR"
    attributed_source: str = "SEARCH"
    experiment_id: str | None = None


class ConversionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: str
    booking_intent_id: str | None = None
    booking_id: str | None = None
    provider_id: str
    consumer_id: str | None = None
    conversion_stage: str
    value: float
    currency: str
    attributed_source: str
    experiment_id: str | None = None
    converted_at: datetime


class FunnelStageItem(BaseModel):
    stage: str
    count: int
    conversion_rate: float
    dropoff_rate: float


class ConversionFunnelResponse(BaseModel):
    total_views: int
    stages: list[FunnelStageItem]
    overall_conversion_rate: float
    total_facilitated_value: float
    currency: str = "INR"
