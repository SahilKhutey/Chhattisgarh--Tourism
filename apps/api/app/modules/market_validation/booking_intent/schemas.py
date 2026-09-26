from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

BOOKING_INTENT_STATUSES = {
    "REQUESTED",
    "PROVIDER_CONFIRMED",
    "CONSUMER_CONFIRMED",
    "PAYMENT_PENDING",
    "BOOKED",
    "CANCELLED",
    "EXPIRED",
}


class BookingIntentCreate(BaseModel):
    lead_id: str
    consumer_id: str | None = None
    provider_id: str
    experience_id: str | None = None
    requested_date: datetime | None = None
    traveler_count: int = 1
    amount_estimate: float = 0.0
    currency: str = "INR"
    idempotency_key: str | None = None
    intent_details: dict | None = None


class BookingIntentUpdate(BaseModel):
    requested_date: datetime | None = None
    traveler_count: int | None = None
    amount_estimate: float | None = None
    status: str | None = None
    intent_details: dict | None = None


class BookingIntentConfirmRequest(BaseModel):
    role: str = "PROVIDER"  # PROVIDER or CONSUMER
    confirmed_price: float | None = None
    notes: str | None = None


class BookingIntentCancelRequest(BaseModel):
    cancellation_reason: str = "TRAVELER_CHANGED_PLAN"
    notes: str | None = None


class BookingIntentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    intent_id: str
    lead_id: str
    consumer_id: str | None = None
    provider_id: str
    experience_id: str | None = None
    requested_date: datetime | None = None
    traveler_count: int = 1
    amount_estimate: float = 0.0
    currency: str = "INR"
    status: str = "REQUESTED"
    idempotency_key: str | None = None
    intent_details: dict | None = None
    created_at: datetime
    updated_at: datetime


class BookingIntentListResponse(BaseModel):
    items: list[BookingIntentResponse]
    total: int
