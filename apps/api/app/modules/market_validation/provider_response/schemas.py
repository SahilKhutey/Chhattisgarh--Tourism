from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

RESPONSE_BUCKETS = {
    "<5m",
    "5-30m",
    "30-120m",
    "2-24h",
    ">24h",
    "NO_RESPONSE",
}


class ProviderResponseCreate(BaseModel):
    lead_id: str
    provider_id: str
    response_type: str = "RESPONDED"
    response_message: str | None = None
    offered_price: float | None = None
    offered_date: datetime | None = None
    metadata_json: dict | None = None


class ProviderResponseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: str
    provider_id: str
    response_type: str
    response_time_seconds: int
    response_bucket: str
    response_message: str | None = None
    offered_price: float | None = None
    offered_date: datetime | None = None
    metadata_json: dict | None = None
    responded_at: datetime
