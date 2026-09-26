from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ReviewValidationCreate(BaseModel):
    review_id: str
    experience_id: str | None = None
    provider_id: str
    consumer_id: str | None = None
    requested_at: datetime | None = None
    submitted_at: datetime | None = None
    verified_experience: bool = True
    rating: float = Field(default=5.0, ge=1.0, le=5.0)
    review_length: int = Field(default=0, ge=0)
    media_attached: bool = False
    experience_specificity: str = "SPECIFIC"  # GENERAL, SPECIFIC, DETAILED
    metadata: dict | None = None


class ReviewDownstreamRecord(BaseModel):
    event_type: str = "VIEW"  # VIEW, SAVE, BOOKING, HELPFUL_VOTE
    session_id: str | None = None


class ReviewValidationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    review_id: str
    experience_id: str | None = None
    provider_id: str
    consumer_id: str | None = None
    requested_at: datetime | None = None
    submitted_at: datetime
    verified_experience: bool
    rating: float
    review_length: int
    media_attached: bool
    experience_specificity: str
    helpful_votes: int
    downstream_views: int
    downstream_saves: int
    downstream_bookings: int
    created_at: datetime


class ReviewQualityMetrics(BaseModel):
    total_reviews: int
    verified_review_percentage: float
    average_rating: float
    average_length_chars: int
    media_attachment_rate: float
    specificity_distribution: dict[str, int]


class ReviewImpactMetrics(BaseModel):
    total_reviews_analyzed: int
    total_downstream_views: int
    total_downstream_saves: int
    total_downstream_bookings: int
    view_to_booking_rate: float
    high_specificity_conversion_lift: float = 2.4
