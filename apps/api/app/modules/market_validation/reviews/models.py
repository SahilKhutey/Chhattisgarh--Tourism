from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from app.core.database import Base


class MarketReviewValidation(Base):
    __tablename__ = "market_review_validations"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    review_id = Column(String(64), nullable=False, unique=True, index=True)
    experience_id = Column(String(64), nullable=True, index=True)
    provider_id = Column(String(36), nullable=False, index=True)
    consumer_id = Column(String(128), nullable=True)
    requested_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    verified_experience = Column(Boolean, nullable=False, default=True)
    rating = Column(Float, nullable=False, default=5.0)
    review_length = Column(Integer, nullable=False, default=0)
    media_attached = Column(Boolean, nullable=False, default=False)
    experience_specificity = Column(String(50), nullable=True, default="SPECIFIC")
    helpful_votes = Column(Integer, nullable=False, default=0)
    downstream_views = Column(Integer, nullable=False, default=0)
    downstream_saves = Column(Integer, nullable=False, default=0)
    downstream_bookings = Column(Integer, nullable=False, default=0)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
