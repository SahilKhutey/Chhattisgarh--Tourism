from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

VALID_RETENTION_STATES = {
    "DISCOVERED",
    "ENGAGED",
    "PLANNING",
    "BOOKED",
    "TRAVELING",
    "COMPLETED",
    "POST_TRIP",
    "RETURNED",
    "REFERRED",
}

VALID_MEANINGFUL_ACTIONS = {
    "DESTINATION_DISCOVERY",
    "DESTINATION_SAVE",
    "TRIP_CREATION",
    "ITINERARY_CREATION",
    "PROVIDER_INQUIRY",
    "BOOKING",
    "REVIEW",
    "TRIP_SHARE",
    "NEW_DESTINATION_DISCOVERY",
}


class MeaningfulActionRecord(BaseModel):
    anonymous_user_id: str
    action_type: str = Field(description="Must be one of valid meaningful action types")
    destination_id: str | None = None
    trip_id: str | None = None
    session_id: str | None = None
    action_timestamp: datetime | None = None
    metadata: dict | None = None


class ConsumerRetentionUpdate(BaseModel):
    retention_state: str | None = None
    trips_created: int | None = None
    trips_completed: int | None = None
    reviews_created: int | None = None
    shares: int | None = None
    referrals: int | None = None


class ConsumerRetentionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    anonymous_user_id: str
    retention_state: str
    first_meaningful_action: str | None = None
    first_meaningful_action_at: datetime | None = None
    first_trip_at: datetime | None = None
    first_completed_experience_at: datetime | None = None
    last_meaningful_action: str | None = None
    last_meaningful_action_at: datetime | None = None
    meaningful_sessions: int
    trips_created: int
    trips_completed: int
    destinations_explored: list[str] | None = None
    reviews_created: int
    shares: int
    referrals: int
    next_trip_started_at: datetime | None = None
    cohort_id: str | None = None
    created_at: datetime
    updated_at: datetime


class TripCycleMetrics(BaseModel):
    completed_first_journey_count: int
    returned_for_next_task_count: int
    trip_cycle_retention_rate: float
    benchmark_target: float = 0.20


class NextTripMetrics(BaseModel):
    completed_first_trip_count: int
    started_second_trip_count: int
    next_trip_rate: float
    average_days_to_next_trip: float


class RetentionOverview(BaseModel):
    total_meaningful_users: int
    active_in_planning: int
    completed_travelers: int
    returned_travelers: int
    trip_cycle_retention_rate: float
    next_trip_rate: float
    state_distribution: dict[str, int]
    top_destinations_explored: dict[str, int]
