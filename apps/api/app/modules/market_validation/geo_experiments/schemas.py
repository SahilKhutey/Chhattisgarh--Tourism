from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

GEO_HYPOTHESES = {
    "H-MV4-001": "Travelers want to discover places near a destination.",
    "H-MV4-002": "Travelers benefit from geographically grouped tourism experiences.",
    "H-MV4-003": "Travelers want to know what destinations can realistically be combined into a trip.",
    "H-MV4-004": "Route-based discovery increases destination exploration.",
    "H-MV4-005": "Geographic context improves trip-planning confidence.",
    "H-MV4-006": "Travelers discover destinations they would otherwise miss when shown contextual nearby places.",
    "H-MV4-007": "Regional tourism zones are more useful for trip planning than isolated destination pages.",
    "H-MV4-008": "Accurate travel-time information materially influences destination selection.",
}

GEO_JTBDS = {
    "GEO-JTBD-001": "Show me what is worth visiting near this destination.",
    "GEO-JTBD-002": "Help me understand what places can be combined into one trip.",
    "GEO-JTBD-003": "Show me interesting places along my route.",
    "GEO-JTBD-004": "Tell me where I should go next.",
    "GEO-JTBD-005": "Help me understand the geographic structure of this region.",
    "GEO-JTBD-006": "Help me estimate whether this itinerary is realistically achievable.",
}

VALID_EXPERIMENT_STATUSES = {"RUNNING", "DRAFT", "COMPLETED", "ARCHIVED"}


class GeoExperimentBase(BaseModel):
    experiment_key: str
    name: str
    hypothesis_key: str
    status: str = "RUNNING"
    control_description: str
    variant_description: str
    primary_metric_name: str
    control_metric_value: float = 0.0
    variant_metric_value: float = 0.0
    sample_size_control: int = 0
    sample_size_variant: int = 0
    statistical_significance: float | None = None
    outcome: str | None = None


class GeoExperimentCreate(GeoExperimentBase):
    pass


class GeoExperimentUpdate(BaseModel):
    name: str | None = None
    status: str | None = None
    control_metric_value: float | None = None
    variant_metric_value: float | None = None
    sample_size_control: int | None = None
    sample_size_variant: int | None = None
    statistical_significance: float | None = None
    outcome: str | None = None


class GeoExperimentResponse(GeoExperimentBase):
    id: UUID
    lift_percentage: float = 0.0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeoExperimentListResponse(BaseModel):
    total: int
    items: list[GeoExperimentResponse]


class GeoObservationCreate(BaseModel):
    participant_id: UUID | None = None
    task_id: str
    source_place_id: str | None = None
    target_place_id: str | None = None
    relationship_type: str
    expected_relationship: str | None = None
    observed_behavior: str
    successful: bool = True
    difficulty: int = Field(default=2, ge=1, le=5)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    evidence_type: str = "USER_OBSERVATION"


class GeoObservationResponse(GeoObservationCreate):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeoObservationListResponse(BaseModel):
    total: int
    items: list[GeoObservationResponse]
