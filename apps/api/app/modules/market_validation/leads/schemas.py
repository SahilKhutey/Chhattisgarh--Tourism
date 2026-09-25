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
}


class LeadBase(BaseModel):
    source: str = "DISCOVERY"
    traveler_segment: str
    destination: str
    experience: str
    request_type: str
    status: str = "NEW"
    qualified: bool = False
    conversion_status: str = "PENDING"
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


class LeadUpdate(BaseModel):
    source: str | None = None
    traveler_segment: str | None = None
    destination: str | None = None
    experience: str | None = None
    request_type: str | None = None
    status: str | None = None
    qualified: bool | None = None
    conversion_status: str | None = None
    outcome: str | None = None
    provider_response_at: datetime | None = None


class LeadQualify(BaseModel):
    qualified: bool = True
    status: str = "QUALIFIED"


class LeadResponseRecord(BaseModel):
    response_at: datetime | None = None
    status: str = "RESPONDED"
    outcome: str | None = None


class LeadBookingRecord(BaseModel):
    conversion_status: str = "CONVERTED"
    status: str = "BOOKED"
    outcome: str | None = "CONFIRMED_BOOKING"


class LeadResponse(LeadBase):
    id: UUID
    provider_id: UUID
    created_at: datetime
    provider_response_at: datetime | None = None
    response_time_seconds: int | None = None

    model_config = ConfigDict(from_attributes=True)


class LeadListResponse(BaseModel):
    total: int
    items: list[LeadResponse]
