from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

VALID_RELATIONSHIPS = {
    "NEARBY",
    "WITHIN_ZONE",
    "CONNECTED_BY_ROUTE",
    "ALONG_ROUTE",
    "NEXT_DESTINATION",
    "ALTERNATIVE_DESTINATION",
    "COMPLEMENTARY_DESTINATION",
    "SAME_EXPERIENCE_CLUSTER",
    "SAME_TRIP_CLUSTER",
    "ACCESSIBLE_FROM",
}

VALID_EVIDENCE_TYPES = {
    "OFFICIAL_DATA",
    "GEOSPATIAL_CALCULATION",
    "ROUTE_DATA",
    "USER_OBSERVATION",
    "PROVIDER_INPUT",
    "RESEARCHER_OBSERVATION",
    "EXPERIMENT",
}

VALID_GEO_STATUSES = {"VALIDATED", "PROVISIONAL", "INVALIDATED", "DISPUTED"}


class GeoRelationshipBase(BaseModel):
    source_destination_id: str
    target_destination_id: str
    relationship_type: str
    straight_line_km: float | None = None
    road_distance_km: float | None = None
    estimated_travel_minutes: int | None = None
    validation_status: str = "PROVISIONAL"
    evidence_type: str = "GEOSPATIAL_CALCULATION"
    evidence_count: int = Field(default=1, ge=0)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    source: str = "ROUTE_CALCULATION"

    @model_validator(mode="before")
    @classmethod
    def validate_relationship(cls, data: dict):
        if isinstance(data, dict):
            rel = data.get("relationship_type")
            if rel and rel not in VALID_RELATIONSHIPS:
                raise ValueError(f"Invalid relationship_type '{rel}'. Must be one of {sorted(VALID_RELATIONSHIPS)}")
            ev = data.get("evidence_type")
            if ev and ev not in VALID_EVIDENCE_TYPES:
                raise ValueError(f"Invalid evidence_type '{ev}'. Must be one of {sorted(VALID_EVIDENCE_TYPES)}")
            status = data.get("validation_status")
            if status and status not in VALID_GEO_STATUSES:
                raise ValueError(f"Invalid validation_status '{status}'. Must be one of {sorted(VALID_GEO_STATUSES)}")
            src = data.get("source_destination_id")
            tgt = data.get("target_destination_id")
            if src and tgt and src == tgt:
                raise ValueError("Self-referential relationship is not allowed.")
        return data


class GeoRelationshipCreate(GeoRelationshipBase):
    pass


class GeoRelationshipUpdate(BaseModel):
    relationship_type: str | None = None
    straight_line_km: float | None = None
    road_distance_km: float | None = None
    estimated_travel_minutes: int | None = None
    validation_status: str | None = None
    evidence_type: str | None = None
    evidence_count: int | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    source: str | None = None


class GeoRelationshipResponse(GeoRelationshipBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeoRelationshipListResponse(BaseModel):
    total: int
    items: list[GeoRelationshipResponse]


class GeoRelevanceBreakdown(BaseModel):
    distance_score: int
    travel_time_score: int
    route_compatibility: int
    experience_compatibility: int
    destination_popularity: int
    user_interest_match: int


class NearbyPlaceItem(BaseModel):
    destination_id: str
    destination_name: str
    tourism_type: str
    district: str
    latitude: float | None = None
    longitude: float | None = None
    distance_km: float
    travel_time_minutes: int
    relationship_type: str
    confidence: float
    geo_relevance_score: int
    relevance_breakdown: GeoRelevanceBreakdown


class NearbyPlacesResponse(BaseModel):
    source_destination_id: str
    radius_km: float
    total: int
    places: list[NearbyPlaceItem]
