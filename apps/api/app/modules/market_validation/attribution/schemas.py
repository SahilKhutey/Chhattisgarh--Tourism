from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class AttributionCreate(BaseModel):
    booking_id: str
    lead_id: str
    anonymous_user_id: str | None = None
    session_id: str | None = None
    source_event_id: str | None = None
    discovery_source: str = "SEARCH"
    destination_id: str | None = None
    experience_id: str | None = None
    provider_id: str
    campaign_id: str | None = None
    experiment_id: str | None = None
    attribution_window_days: int = 30
    chain_details: dict | None = None


class AttributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    booking_id: str
    lead_id: str
    anonymous_user_id: str | None = None
    session_id: str | None = None
    source_event_id: str | None = None
    discovery_source: str
    destination_id: str | None = None
    experience_id: str | None = None
    provider_id: str
    campaign_id: str | None = None
    experiment_id: str | None = None
    attribution_window_days: int
    chain_details: dict | None = None
    created_at: datetime
