from __future__ import annotations

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Date, DateTime, JSON
from app.core.database import Base


class MarketRetentionCohort(Base):
    __tablename__ = "market_retention_cohorts"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    cohort_date = Column(Date, nullable=False, index=True)
    acquisition_source = Column(String(50), nullable=False, index=True)
    first_action = Column(String(100), nullable=True)
    first_destination = Column(String(100), nullable=True)
    segment = Column(String(50), nullable=True, default="GENERAL")
    traveler_type = Column(String(50), nullable=True, default="DOMESTIC")
    geography = Column(String(50), nullable=True, default="BASTAR")
    cohort_size = Column(Integer, nullable=False, default=0)
    d1_retained = Column(Integer, nullable=False, default=0)
    d7_retained = Column(Integer, nullable=False, default=0)
    d30_retained = Column(Integer, nullable=False, default=0)
    trip_cycle_retained = Column(Integer, nullable=False, default=0)
    next_trip_count = Column(Integer, nullable=False, default=0)
    destinations_expanded_count = Column(Integer, nullable=False, default=0)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
