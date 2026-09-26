from __future__ import annotations

from pydantic import BaseModel

VALID_RETENTION_FAILURES = {
    "NO_NEW_TRIP",
    "NO_RELEVANT_DESTINATION",
    "POOR_FIRST_EXPERIENCE",
    "CONTENT_GAP",
    "TRUST_ISSUE",
    "BOOKING_FAILURE",
    "PROVIDER_FAILURE",
    "LOW_REGIONAL_COVERAGE",
    "SEASONALITY",
    "USER_COMPLETED_NEED",
    "TECHNICAL_FAILURE",
    "UNKNOWN",
}


class FailureCauseCount(BaseModel):
    cause: str
    count: int
    percentage: float


class SeasonalityCohortAnalysis(BaseModel):
    season_name: str  # MONSOON, WINTER_PEAK, SUMMER, DUSSEHRA_FESTIVAL
    cohort_count: int
    trip_cycle_retention_rate: float
    next_trip_rate: float
    seasonality_adjustment_factor: float


class MacroRetentionReport(BaseModel):
    trip_cycle_retention_rate: float
    next_trip_rate: float
    destination_expansion_rate: float
    provider_continuation_rate: float
    creator_continuation_rate: float
    network_health_score: float
    failure_causes_breakdown: list[FailureCauseCount]
    seasonality_cohorts: list[SeasonalityCohortAnalysis]
    retention_decision: str  # SUPPORTED, PARTIALLY_SUPPORTED, INCONCLUSIVE, INVALIDATED
