from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_CONTINUATION_STATUSES = {
    "CONTINUOUS",
    "OCCASIONAL",
    "AT_RISK",
    "CHURNED",
    "REACTIVATED",
}


class ProviderActivityRecord(BaseModel):
    provider_id: str
    activity_type: str = "LISTING_UPDATE"  # LISTING_UPDATE, LEAD_RESPONSE, BOOKING_MANAGEMENT, ANALYTICS_VIEW
    activity_timestamp: datetime | None = None
    region: str | None = None
    metadata: dict | None = None


class ProviderRetentionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    provider_id: str
    is_active: bool
    onboarded_at: datetime
    last_active_at: datetime
    last_lead_at: datetime | None = None
    last_lead_responded_at: datetime | None = None
    last_listing_update_at: datetime | None = None
    total_leads_received: int
    total_leads_responded: int
    total_bookings_managed: int
    listing_update_count: int
    reactivated_count: int
    continuation_status: str
    supply_density_region: str | None = None
    lead_response_rate: float = 0.0
    created_at: datetime
    updated_at: datetime


class ProviderRetentionOverview(BaseModel):
    total_providers_onboarded: int
    active_providers_count: int
    continuation_rate: float
    reactivated_providers_count: int
    average_listing_updates_per_provider: float
    status_distribution: dict[str, int]


class ProviderSupplyDensityMetrics(BaseModel):
    region: str
    verified_providers: int
    active_providers: int
    average_lead_capacity: int
    experience_diversity_count: int
