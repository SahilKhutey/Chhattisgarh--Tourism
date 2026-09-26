from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_PILOT_STATUSES = {
    "DRAFT",
    "DESIGNED",
    "APPROVED",
    "READY",
    "ACTIVE",
    "PAUSED",
    "COMPLETED",
    "FAILED",
    "PROMOTED",
    "CANCELLED",
}

PILOT_TRANSITIONS = {
    "DRAFT": {"DESIGNED", "CANCELLED"},
    "DESIGNED": {"APPROVED", "CANCELLED"},
    "APPROVED": {"READY", "CANCELLED"},
    "READY": {"ACTIVE", "CANCELLED"},
    "ACTIVE": {"PAUSED", "COMPLETED", "FAILED"},
    "PAUSED": {"ACTIVE", "FAILED", "CANCELLED"},
    "COMPLETED": {"PROMOTED"},
    "FAILED": set(),
    "PROMOTED": set(),
    "CANCELLED": set(),
}


class PilotScope(BaseModel):
    in_scope: list[str] = [
        "destination_discovery",
        "search",
        "map_navigation",
        "nearby_attractions",
        "trip_planning",
        "itinerary_builder",
        "provider_discovery",
        "verified_lead_handoff",
    ]
    out_of_scope: list[str] = [
        "statewide_unrestricted_marketplace",
        "unverified_provider_self_onboarding",
        "custodial_hotel_inventory_escrow",
        "out_of_state_expansion",
        "unvetted_adventure_sports",
    ]


class PilotCreate(BaseModel):
    name: str = "Bastar Tribal Heritage Pilot — Circuit 1"
    validation_decision_id: str  # Consumed from MV10
    geography_scope: dict = {
        "division": "Bastar",
        "districts": ["Bastar", "Dantewada"],
        "tourism_zone": "Chitrakote-Kanger-Valley",
    }
    consumer_segments: list[str] = ["EXPERIENTIAL_EXPLORERS", "ECO_CULTURAL_TRAVELERS"]
    provider_segments: list[str] = ["RURAL_HOMESTAYS", "LICENSED_TRIBAL_GUIDES", "COMMUNITY_CAMPS"]
    destination_ids: list[str] = ["chitrakote-falls", "tirathgarh-falls", "kanger-valley-caves", "dholkal-ganesh"]
    provider_ids: list[str] = ["bastar-homestay-01", "kanger-eco-guide-02", "dantewada-camp-03"]
    experience_ids: list[str] = ["dhokra-metal-craft-trail", "kanger-river-kayak", "gondi-village-feast"]
    product_scope: PilotScope = Field(default_factory=PilotScope)
    success_metrics: dict = {
        "discovery_success_rate": 0.65,
        "itinerary_completion_rate": 0.25,
        "lead_qualification_rate": 0.70,
        "provider_response_rate": 0.75,
        "trip_cycle_retention": 0.22,
    }
    failure_metrics: dict = {
        "critical_safety_incidents": 1,
        "booking_failure_rate": 0.15,
        "provider_response_breach": 0.40,
    }
    minimum_sample: int = Field(default=50, ge=10)
    target_sample: int = Field(default=200, ge=20)
    budget_band: str = "PILOT_TIER_1_INR_50K"
    launch_owner: str = "PRODUCT_LEADER"


class PilotUpdate(BaseModel):
    name: str | None = None
    status: str | None = None
    geography_scope: dict | None = None
    consumer_segments: list[str] | None = None
    provider_segments: list[str] | None = None
    destination_ids: list[str] | None = None
    provider_ids: list[str] | None = None
    experience_ids: list[str] | None = None
    product_scope: PilotScope | None = None
    success_metrics: dict | None = None
    failure_metrics: dict | None = None
    minimum_sample: int | None = None
    target_sample: int | None = None
    budget_band: str | None = None
    launch_owner: str | None = None


class PilotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    validation_decision_id: str
    status: str
    version: int
    start_date: datetime | None = None
    end_date: datetime | None = None
    geography_scope: dict | None = None
    consumer_segments: list[str] | None = None
    provider_segments: list[str] | None = None
    destination_ids: list[str] | None = None
    provider_ids: list[str] | None = None
    experience_ids: list[str] | None = None
    product_scope: dict | None = None
    success_metrics: dict | None = None
    failure_metrics: dict | None = None
    minimum_sample: int
    target_sample: int
    budget_band: str
    operational_capacity: dict | None = None
    launch_owner: str
    created_at: datetime
    updated_at: datetime


class PilotCohortCreate(BaseModel):
    pilot_id: str
    cohort_name: str
    acquisition_channel: str = "ORGANIC_SEARCH"
    consumer_segment: str = "EXPERIENTIAL_EXPLORERS"
    geography: str = "Bastar"
    language: str = "hi"
    device: str = "MOBILE"
    users: int = 0
    activated_users: int = 0
    planners: int = 0
    leads: int = 0
    bookings: int = 0
    completed_experiences: int = 0
    returning_users: int = 0


class PilotCohortResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pilot_id: str
    cohort_name: str
    acquisition_channel: str
    consumer_segment: str
    geography: str
    language: str
    device: str
    users: int
    activated_users: int
    planners: int
    leads: int
    bookings: int
    completed_experiences: int
    returning_users: int
    created_at: datetime


class PilotAuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pilot_id: str
    event_type: str
    actor_id: str
    actor_role: str
    details: dict | None = None
    timestamp: datetime
