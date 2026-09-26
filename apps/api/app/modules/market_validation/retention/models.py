from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from app.core.database import Base


class MarketConsumerRetention(Base):
    __tablename__ = "market_consumer_retention"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    anonymous_user_id = Column(String(128), nullable=False, unique=True, index=True)
    retention_state = Column(String(50), nullable=False, default="DISCOVERED")
    first_meaningful_action = Column(String(100), nullable=True)
    first_meaningful_action_at = Column(DateTime(timezone=True), nullable=True)
    first_trip_at = Column(DateTime(timezone=True), nullable=True)
    first_completed_experience_at = Column(DateTime(timezone=True), nullable=True)
    last_meaningful_action = Column(String(100), nullable=True)
    last_meaningful_action_at = Column(DateTime(timezone=True), nullable=True)
    meaningful_sessions = Column(Integer, nullable=False, default=1)
    trips_created = Column(Integer, nullable=False, default=0)
    trips_completed = Column(Integer, nullable=False, default=0)
    destinations_explored = Column(JSON, nullable=True)
    reviews_created = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    referrals = Column(Integer, nullable=False, default=0)
    next_trip_started_at = Column(DateTime(timezone=True), nullable=True)
    cohort_id = Column(String(36), nullable=True, index=True)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
