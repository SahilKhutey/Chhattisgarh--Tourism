from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.core.database import Base


class MarketCreatorRetention(Base):
    __tablename__ = "market_creator_retention"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    creator_id = Column(String(128), nullable=False, unique=True, index=True)
    profile_created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    last_submission_at = Column(DateTime(timezone=True), nullable=True)
    content_submitted_count = Column(Integer, nullable=False, default=0)
    content_published_count = Column(Integer, nullable=False, default=0)
    total_content_views = Column(Integer, nullable=False, default=0)
    total_content_saves = Column(Integer, nullable=False, default=0)
    downstream_trips_influenced = Column(Integer, nullable=False, default=0)
    creator_reactivated_count = Column(Integer, nullable=False, default=0)
    retention_state = Column(String(50), nullable=False, default="ACTIVE")
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
