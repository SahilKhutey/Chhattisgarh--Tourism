from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_PROVIDER_TYPES = {
    # ACCOMMODATION
    "HOTEL", "HOMESTAY", "RESORT", "GUESTHOUSE", "CAMPING",
    # EXPERIENCE
    "LOCAL_GUIDE", "TOUR_OPERATOR", "ADVENTURE_PROVIDER",
    "WILDLIFE_EXPERIENCE", "CULTURAL_EXPERIENCE", "COMMUNITY_EXPERIENCE",
    # FOOD
    "RESTAURANT", "LOCAL_FOOD", "CAFE", "FOOD_EXPERIENCE",
    # TRANSPORT
    "TAXI", "LOCAL_TRANSPORT", "TOUR_TRANSPORT", "RENTAL",
    # CULTURAL
    "ARTISAN", "CRAFT", "CULTURAL_ORGANIZATION", "COMMUNITY_ORGANIZATION",
    # CREATOR
    "PHOTOGRAPHER", "VIDEOGRAPHER", "TRAVEL_CREATOR", "LOCAL_STORYTELLER",
    # OTHER
    "TOURISM_BUSINESS", "TOURISM_SERVICE",
}

VALID_PROVIDER_SEGMENTS = {
    "INDIVIDUAL",
    "MICRO_BUSINESS",
    "SMALL_BUSINESS",
    "MEDIUM_BUSINESS",
    "LARGE_BUSINESS",
    "COMMUNITY",
    "NON_PROFIT",
    "GOVERNMENT",
}

VALID_DIGITAL_MATURITY = {
    "OFFLINE_ONLY",
    "BASIC_DIGITAL",
    "SOCIAL_FIRST",
    "MARKETPLACE_PRESENT",
    "DIGITALLY_MATURE",
}


class ProviderBase(BaseModel):
    canonical_provider_id: UUID | None = None
    provider_type: str
    segment: str
    business_name: str
    geography: str
    operating_area: str
    verification_status: str = "UNVERIFIED"
    digital_presence: str = "BASIC_DIGITAL"
    acquisition_channels: list[str] = Field(default_factory=list)
    booking_method: str = "WHATSAPP"
    response_method: str = "PHONE"
    current_demand: str = "LOW"
    desired_demand: str = "HIGH"
    willingness_to_participate: bool = True
    willingness_to_pay: str = "UNDECIDED"
    research_status: str = "PROSPECT"

    @model_validator(mode="before")
    @classmethod
    def validate_provider(cls, data: dict):
        if not isinstance(data, dict):
            return data
        ptype = data.get("provider_type")
        if ptype and ptype not in VALID_PROVIDER_TYPES:
            raise ValueError(f"Invalid provider_type '{ptype}'. Must be one of {sorted(VALID_PROVIDER_TYPES)}")
        seg = data.get("segment")
        if seg and seg not in VALID_PROVIDER_SEGMENTS:
            raise ValueError(f"Invalid segment '{seg}'. Must be one of {sorted(VALID_PROVIDER_SEGMENTS)}")
        dig = data.get("digital_presence", "BASIC_DIGITAL")
        if dig not in VALID_DIGITAL_MATURITY:
            raise ValueError(f"Invalid digital_presence '{dig}'. Must be one of {sorted(VALID_DIGITAL_MATURITY)}")
        return data


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    canonical_provider_id: UUID | None = None
    provider_type: str | None = None
    segment: str | None = None
    business_name: str | None = None
    geography: str | None = None
    operating_area: str | None = None
    verification_status: str | None = None
    digital_presence: str | None = None
    acquisition_channels: list[str] | None = None
    booking_method: str | None = None
    response_method: str | None = None
    current_demand: str | None = None
    desired_demand: str | None = None
    willingness_to_participate: bool | None = None
    willingness_to_pay: str | None = None
    research_status: str | None = None

    @model_validator(mode="before")
    @classmethod
    def validate_updates(cls, data: dict):
        if not isinstance(data, dict):
            return data
        ptype = data.get("provider_type")
        if ptype is not None and ptype not in VALID_PROVIDER_TYPES:
            raise ValueError(f"Invalid provider_type '{ptype}'.")
        seg = data.get("segment")
        if seg is not None and seg not in VALID_PROVIDER_SEGMENTS:
            raise ValueError(f"Invalid segment '{seg}'.")
        return data


class ProviderResponse(ProviderBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProviderListResponse(BaseModel):
    total: int
    items: list[ProviderResponse]


class ProviderResearchCreate(BaseModel):
    researcher_id: str
    interview_date: datetime
    duration_minutes: int = Field(ge=5, le=480)
    acquisition_channels: list[str] | None = None
    booking_channels: list[str] | None = None
    operational_tools: list[str] | None = None
    current_pain: str
    desired_outcome: str
    demand_problem: str | None = None
    digital_problem: str | None = None
    trust_problem: str | None = None
    booking_problem: str | None = None
    response_problem: str | None = None
    summary: str | None = None


class ProviderResearchResponse(ProviderResearchCreate):
    id: UUID
    provider_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
