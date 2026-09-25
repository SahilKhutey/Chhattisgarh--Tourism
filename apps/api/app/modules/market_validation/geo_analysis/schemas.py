from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class NearbyAnalysisResponse(BaseModel):
    total_nearby_queries: int
    planning_activations: int
    activation_rate: float
    avg_explored_radius_km: float
    top_explored_destinations: list[dict]


class RouteAnalysisResponse(BaseModel):
    total_route_validations: int
    feasible_routes: int
    difficult_routes: int
    unrealistic_routes: int
    feasibility_rate: float
    avg_duration_minutes: float


class DiscoveryAnalysisResponse(BaseModel):
    discovery_expansion_rate: float
    avg_places_discovered_per_session: float
    top_discovered_unplanned_places: list[dict]


class ClusterAnalysisResponse(BaseModel):
    clusters: list[dict]
    top_cluster_by_engagement: str


class GeographicUtilityResponse(BaseModel):
    region_id: str
    relevance_score: float
    discovery_score: float
    planning_impact_score: float
    confidence_score: float
    overall_utility_score: float
    decision_recommendation: str


class RegionalOverviewResponse(BaseModel):
    region_id: str
    total_destinations: int
    total_relationships: int
    validated_relationships: int
    uncertain_relationships: int
    invalidated_relationships: int
    geographic_jobs_progress: dict[str, float]
