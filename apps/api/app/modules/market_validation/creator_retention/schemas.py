from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_CREATOR_STATES = {
    "ACTIVE",
    "INACTIVE",
    "REACTIVATED",
    "PROLIFIC",
}


class CreatorActivityRecord(BaseModel):
    creator_id: str
    activity_type: str = "CONTENT_SUBMITTED"  # CONTENT_SUBMITTED, CONTENT_PUBLISHED, VIEW_ACCRUED, SAVE_ACCRUED, TRIP_INFLUENCED
    count: int = Field(default=1, ge=1)
    timestamp: datetime | None = None
    metadata: dict | None = None


class CreatorRetentionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    creator_id: str
    profile_created_at: datetime
    last_submission_at: datetime | None = None
    content_submitted_count: int
    content_published_count: int
    total_content_views: int
    total_content_saves: int
    downstream_trips_influenced: int
    creator_reactivated_count: int
    retention_state: str
    created_at: datetime
    updated_at: datetime


class CreatorLoopMetrics(BaseModel):
    total_active_creators: int
    total_content_pieces: int
    total_views_generated: int
    total_trips_influenced: int
    creator_continuation_rate: float
    average_trips_per_creator: float
