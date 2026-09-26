from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_REFERRAL_CHANNELS = {
    "WHATSAPP",
    "LINK",
    "SOCIAL",
    "EMAIL",
    "DIRECT",
    "OTHER",
}

VALID_REFERRAL_STATUSES = {
    "CREATED",
    "OPENED",
    "ACTIVATED",
    "CONVERTED",
}


class ReferralCreate(BaseModel):
    referrer_id: str
    referral_channel: str = "LINK"
    referral_code: str | None = None
    trip_id: str | None = None
    destination_id: str | None = None
    context_type: str = "TRIP"
    metadata: dict | None = None


class ReferralActivateRequest(BaseModel):
    recipient_anonymous_id: str
    action: str = "VISIT"  # VISIT, ACTIVATED, TRIP_CREATED, CONVERTED


class ReferralResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    referrer_id: str
    referral_code: str
    referral_channel: str
    trip_id: str | None = None
    destination_id: str | None = None
    context_type: str
    recipient_anonymous_id: str | None = None
    status: str
    first_visit_at: datetime | None = None
    activated_at: datetime | None = None
    trip_created_at: datetime | None = None
    converted_at: datetime | None = None
    created_at: datetime


class ReferralStatusResponse(BaseModel):
    id: str
    referral_code: str
    status: str
    recipient_anonymous_id: str | None = None
    activated: bool


class ReferralFunnelMetrics(BaseModel):
    total_shares: int
    links_opened: int
    activated_users: int
    trips_created_from_referral: int
    conversions: int
    share_open_rate: float
    activation_rate: float
    conversion_rate: float
