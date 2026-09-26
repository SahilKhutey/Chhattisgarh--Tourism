from __future__ import annotations

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.reviews.models import MarketReviewValidation
from app.modules.market_validation.reviews.repository import ReviewValidationRepository
from app.modules.market_validation.reviews.schemas import (
    ReviewValidationCreate,
    ReviewDownstreamRecord,
    ReviewValidationResponse,
    ReviewQualityMetrics,
    ReviewImpactMetrics,
)


class ReviewValidationService:
    def __init__(self, repo: ReviewValidationRepository | None = None):
        self.repo = repo or ReviewValidationRepository()

    def record_review(self, db: Session, payload: ReviewValidationCreate) -> ReviewValidationResponse:
        existing = self.repo.get_by_id(db, payload.review_id)
        if existing:
            return ReviewValidationResponse.model_validate(existing)

        item = MarketReviewValidation(
            review_id=payload.review_id,
            experience_id=payload.experience_id,
            provider_id=payload.provider_id,
            consumer_id=payload.consumer_id,
            requested_at=payload.requested_at,
            submitted_at=payload.submitted_at or datetime.now(timezone.utc),
            verified_experience=payload.verified_experience,
            rating=payload.rating,
            review_length=payload.review_length,
            media_attached=payload.media_attached,
            experience_specificity=payload.experience_specificity,
            metadata_json=payload.metadata or {},
        )
        saved = self.repo.create(db, item)
        return ReviewValidationResponse.model_validate(saved)

    def record_downstream_impact(self, db: Session, review_id: str, payload: ReviewDownstreamRecord) -> ReviewValidationResponse:
        item = self.repo.get_by_id(db, review_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Review '{review_id}' not found.",
            )

        if payload.event_type == "VIEW":
            item.downstream_views += 1
        elif payload.event_type == "SAVE":
            item.downstream_saves += 1
        elif payload.event_type == "BOOKING":
            item.downstream_bookings += 1
        elif payload.event_type == "HELPFUL_VOTE":
            item.helpful_votes += 1

        saved = self.repo.update(db, item)
        return ReviewValidationResponse.model_validate(saved)

    def get_quality_metrics(self, db: Session) -> ReviewQualityMetrics:
        total, items = self.repo.list(db, limit=10000)
        if total == 0:
            return ReviewQualityMetrics(
                total_reviews=0,
                verified_review_percentage=0.0,
                average_rating=5.0,
                average_length_chars=0,
                media_attachment_rate=0.0,
                specificity_distribution={"GENERAL": 0, "SPECIFIC": 0, "DETAILED": 0},
            )

        verified = sum(1 for r in items if r.verified_experience)
        avg_rating = sum(r.rating for r in items) / total
        avg_len = sum(r.review_length for r in items) // total
        media = sum(1 for r in items if r.media_attached)
        spec_dist: dict[str, int] = {}
        for r in items:
            key = r.experience_specificity or "SPECIFIC"
            spec_dist[key] = spec_dist.get(key, 0) + 1

        return ReviewQualityMetrics(
            total_reviews=total,
            verified_review_percentage=round(verified / total, 4),
            average_rating=round(avg_rating, 2),
            average_length_chars=avg_len,
            media_attachment_rate=round(media / total, 4),
            specificity_distribution=spec_dist,
        )

    def get_impact_metrics(self, db: Session) -> ReviewImpactMetrics:
        total, items = self.repo.list(db, limit=10000)
        views = sum(r.downstream_views for r in items)
        saves = sum(r.downstream_saves for r in items)
        bookings = sum(r.downstream_bookings for r in items)
        v_to_b = round(bookings / max(1, views), 4) if views > 0 else 0.0

        return ReviewImpactMetrics(
            total_reviews_analyzed=total,
            total_downstream_views=views,
            total_downstream_saves=saves,
            total_downstream_bookings=bookings,
            view_to_booking_rate=v_to_b,
        )
