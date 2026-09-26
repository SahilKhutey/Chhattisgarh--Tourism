from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_ACTOR_TYPES = {"TRAVELER", "PROVIDER", "CREATOR", "SYSTEM"}
VALID_TARGET_TYPES = {"DESTINATION", "EXPERIENCE", "PROVIDER", "CREATOR", "TRIP", "REVIEW"}
VALID_INTERACTION_TYPES = {
    "VIEW",
    "SAVE",
    "SHARE",
    "FOLLOW",
    "REVIEW",
    "CONTACT",
    "BOOK",
    "COMPLETE",
    "REFER",
    "CONTRIBUTE",
}


class NetworkInteractionCreate(BaseModel):
    actor_type: str = "TRAVELER"
    actor_id: str
    target_type: str = "PROVIDER"
    target_id: str
    interaction_type: str = "CONTACT"
    session_id: str | None = None
    source: str | None = "DESTINATION"
    geography: str | None = "BASTAR"
    metadata: dict | None = None


class NetworkInteractionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_type: str
    actor_id: str
    target_type: str
    target_id: str
    interaction_type: str
    session_id: str | None = None
    source: str | None = None
    geography: str | None = None
    created_at: datetime


class NetworkDensityMetrics(BaseModel):
    total_travelers: int
    active_providers: int
    active_creators: int
    destinations_represented: int
    total_meaningful_interactions: int
    interactions_per_active_user: float
    traveler_to_provider_edges: int
    traveler_to_destination_edges: int
    traveler_to_creator_edges: int
    traveler_to_traveler_edges: int


class NetworkHealthScore(BaseModel):
    network_health_score: float  # 0-100
    supply_quality_component: float
    content_quality_component: float
    traveler_activity_component: float
    interaction_density_component: float
    transaction_success_component: float
    interpretation: str


class NetworkGapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    geography: str
    destination: str
    provider_supply_count: int
    content_supply_count: int
    traveler_demand_score: float
    interaction_density: float
    booking_activity: int
    retention_rate: float
    opportunity_score: float
    recommended_action: str | None = None


class NetworkRegionalView(BaseModel):
    geography: str
    supply_density: int
    content_density: int
    traveler_activity: int
    booking_volume: int
    retention_rate: float
    opportunity_score: float
