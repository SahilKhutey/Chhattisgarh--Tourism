from __future__ import annotations

from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


class CohortCreate(BaseModel):
    cohort_date: date
    acquisition_source: str = "SEARCH"
    first_action: str | None = "DESTINATION_DISCOVERY"
    first_destination: str | None = "Bastar"
    segment: str | None = "ECO_TOURIST"
    traveler_type: str | None = "DOMESTIC"
    geography: str | None = "BASTAR"
    cohort_size: int = Field(default=0, ge=0)
    metadata: dict | None = None


class CohortUpdateMetrics(BaseModel):
    d1_retained: int | None = None
    d7_retained: int | None = None
    d30_retained: int | None = None
    trip_cycle_retained: int | None = None
    next_trip_count: int | None = None
    destinations_expanded_count: int | None = None


class CohortResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    cohort_date: date
    acquisition_source: str
    first_action: str | None = None
    first_destination: str | None = None
    segment: str | None = None
    traveler_type: str | None = None
    geography: str | None = None
    cohort_size: int
    d1_retained: int
    d7_retained: int
    d30_retained: int
    trip_cycle_retained: int
    next_trip_count: int
    destinations_expanded_count: int
    d1_rate: float = 0.0
    d7_rate: float = 0.0
    d30_rate: float = 0.0
    trip_cycle_rate: float = 0.0
    next_trip_rate: float = 0.0
    destination_expansion_rate: float = 0.0
    created_at: datetime
    updated_at: datetime


class CohortListResponse(BaseModel):
    total: int
    items: list[CohortResponse]
