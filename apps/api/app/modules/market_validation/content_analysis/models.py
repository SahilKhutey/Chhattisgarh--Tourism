from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketContentPerformance(Base):
    __tablename__ = "market_content_performance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_entry_id = Column(String(100), unique=True, nullable=False, index=True)
    impressions = Column(Integer, nullable=False, default=0)
    opens = Column(Integer, nullable=False, default=0)
    engaged_sessions = Column(Integer, nullable=False, default=0)
    saves = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    second_destination_views = Column(Integer, nullable=False, default=0)
    itinerary_starts = Column(Integer, nullable=False, default=0)
    itinerary_completions = Column(Integer, nullable=False, default=0)
    planning_activation_rate = Column(Float, nullable=False, default=0.0)
    discovery_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
