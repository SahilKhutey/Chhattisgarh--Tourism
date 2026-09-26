from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_LEAD_STATUSES = {
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "RESPONDED",
    "NEGOTIATING",
    "BOOKED",
    "COMPLETED",
    "LOST",
    "CANCELLED",
}

VALID_CONVERSION_STATUSES = {
    "PENDING",
    "ACCEPTED",
    "DECLINED",
    "EXPIRED",
    "CONVERTED",
    "CONTACT",
    "QUALIFIED",
    "BOOKING_INTENT",
    "BOOKED",
    "COMPLETED",
}

QUALIFICATION_STATUSES = {
    "UNQUALIFIED",
    "PENDING",
    "QUALIFIED",
    "DISQUALIFIED",
}

DISQUALIFICATION_REASONS = {
    "WRONG_PROVIDER",
    "INVALID_REQUEST",
    "DUPLICATE",
    "SPAM",
    "OUT_OF_SERVICE_AREA",
    "INSUFFICIENT_INFORMATION",
    "OTHER",
}

LEAD_SOURCES = {
    "SEARCH",
    "DESTINATION",
    "MAP",
    "NEARBY",
    "EXPERIENCE",
    "CREATOR",
    "ROUTE",
    "RECOMMENDATION",
    "TRIP",
    "SHARED",
    "DIRECT",
    "DISCOVERY",
    "MAP_EXPLORER",
    "PORTAL",
}


class LeadBase(BaseModel):
    source: str = "SEARCH"
    traveler_segment: str = "GENERAL"
    destination: str = "Bastar"
    experience: str = "Local Guided Experience"
    request_type: str = "BOOKING_INQUIRY"
    status: str = "NEW"
    qualified: bool = False
    conversion_status: str = "CONTACT"
    outcome: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_lead(cls, data: dict):
        if isinstance(data, dict):
            status = data.get("status")
            if status and status not in VALID_LEAD_STATUSES:
                raise ValueError(f"Invalid lead status '{status}'. Must be one of {sorted(VALID_LEAD_STATUSES)}")
            conv = data.get("conversion_status")
            if conv and conv not in VALID_CONVERSION_STATUSES:
                raise ValueError(f"Invalid conversion_status '{conv}'. Must be one of {sorted(VALID_CONVERSION_STATUSES)}")
        return data


class LeadCreate(LeadBase):
    provider_id: UUID


class MarketLeadCreate(BaseModel):
    provider_id: UUID
    consumer_id: str | None = None
    anonymous_user_id: str | None = None
    session_id: str | None = None
    source: str = "SEARCH"
    destination_id: str | None = None
    experience_id: str | None = None
    request_type: str = "BOOKING_INQUIRY"
    requested_date: datetime | None = None
    traveler_count: int = 1
    budget_band: str | None = None
    message: str | None = None
    traveler_segment: str | None = "GENERAL"
    destination: str | None = "Bastar"
    experience: str | None = "Local Guided Experience"
    lead_details: dict | None = None


class LeadUpdate(BaseModel):
    source: str | None = None
    traveler_segment: str | None = None
    destination: str | None = None
    experience: str | None = None
    request_type: str | None = None
    status: str | None = None
    qualified: bool | None = None
    qualification_status: str | None = None
    disqualification_reason: str | None = None
    conversion_status: str | None = None
    outcome: str | None = None
    provider_response_status: str | None = None


class LeadQualify(BaseModel):
    qualified: bool = True
    outcome: str | None = None


class MarketLeadQualifyRequest(BaseModel):
    qualification_status: str = "QUALIFIED"  # QUALIFIED or DISQUALIFIED
    disqualification_reason: str | None = None
    notes: str | None = None


class MarketLeadRespondRequest(BaseModel):
    response_type: str = "RESPONDED"  # ACCEPT, DECLINE, QUESTION, QUOTE
    response_message: str | None = None
    offered_price: float | None = None
    offered_date: datetime | None = None
    metadata: dict | None = None


class LeadResponseRecord(BaseModel):
    response_at: datetime | None = None
    provider_response_at: datetime | None = None
    response_time_seconds: int = Field(default=0, ge=0)
    status: str = "RESPONDED"
    outcome: str | None = None


class LeadBookingRecord(BaseModel):
    outcome: str = "BOOKED"
    conversion_status: str = "CONVERTED"


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    provider_id: UUID
    lead_id: str | None = None
    consumer_id: str | None = None
    anonymous_user_id: str | None = None
    session_id: str | None = None
    source: str
    destination_id: str | None = None
    experience_id: str | None = None
    traveler_segment: str
    destination: str
    experience: str
    request_type: str
    requested_date: datetime | None = None
    traveler_count: int = 1
    budget_band: str | None = None
    message: str | None = None
    status: str
    qualified: bool
    qualification_status: str = "PENDING"
    disqualification_reason: str | None = None
    provider_response_status: str = "NEW"
    conversion_status: str
    outcome: str | None = None
    lead_details: dict | None = None
    created_at: datetime
    updated_at: datetime | None = None
    provider_response_at: datetime | None = None
    response_time_seconds: int | None = None


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
