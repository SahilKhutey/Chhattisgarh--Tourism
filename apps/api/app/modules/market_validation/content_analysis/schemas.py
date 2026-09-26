from __future__ import annotations

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ContentPerformanceResponse(BaseModel):
    id: UUID
    content_entry_id: str
    impressions: int
    opens: int
    engaged_sessions: int
    saves: int
    shares: int
    second_destination_views: int
    itinerary_starts: int
    itinerary_completions: int
    planning_activation_rate: float
    discovery_score: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentOverviewAnalysis(BaseModel):
    total_content_entries: int
    verified_entries: int
    needs_review_entries: int
    stale_entries: int
    average_quality_score: float
    average_trust_score: float
    discovery_surfaces: dict[str, float]
    planning_conversion: dict[str, float]
    active_experiments: int


class QualityVsPerformanceAnalysis(BaseModel):
    high_quality_group: dict
    low_quality_group: dict
    save_rate_lift: float
    planning_rate_lift: float
    conclusion: str
