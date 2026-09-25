from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ProviderMetricBase(BaseModel):
    impressions: int = 0
    profile_views: int = 0
    contacts: int = 0
    qualified_leads: int = 0
    bookings: int = 0
    completed_services: int = 0
    estimated_revenue: float = 0.0
    time_saved: int = 0
    response_time_avg_seconds: int = 0
    perceived_value: str = "MODERATE"


class ProviderMetricCreate(ProviderMetricBase):
    provider_id: UUID


class ProviderMetricUpdate(BaseModel):
    impressions: int | None = None
    profile_views: int | None = None
    contacts: int | None = None
    qualified_leads: int | None = None
    bookings: int | None = None
    completed_services: int | None = None
    estimated_revenue: float | None = None
    time_saved: int | None = None
    response_time_avg_seconds: int | None = None
    perceived_value: str | None = None


class ProviderMetricResponse(ProviderMetricBase):
    id: UUID
    provider_id: UUID
    conversion_rate: float = 0.0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProviderFunnelAnalysis(BaseModel):
    total_providers: int
    onboarded_providers: int
    published_listings: int
    total_leads: int
    qualified_leads: int
    bookings: int
    onboarding_completion_rate: float
    lead_qualification_rate: float
    booking_conversion_rate: float


class ProviderValueAnalysis(BaseModel):
    total_estimated_revenue: float
    total_bookings: int
    total_completed_services: int
    avg_perceived_value: str
    providers_willing_to_pay_percentage: float


class ProviderResponseAnalysis(BaseModel):
    avg_response_time_seconds: float
    response_rate: float
    response_buckets: dict[str, int]
