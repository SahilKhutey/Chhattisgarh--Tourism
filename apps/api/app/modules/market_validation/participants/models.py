from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketParticipant(Base):
    __tablename__ = "market_participants"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    anonymous_id = Column(String(64), unique=True, nullable=False, index=True)
    segment = Column(String(64), nullable=False, index=True)
    traveler_type = Column(JSON, nullable=False, default=list)
    origin_region = Column(String(120), nullable=False)
    age_band = Column(String(32), nullable=False)
    travel_frequency = Column(String(64), nullable=False)
    cg_visit_history = Column(String(64), nullable=False)
    digital_behavior = Column(JSON, nullable=True)
    planning_method = Column(String(64), nullable=False)
    preferred_language = Column(String(16), nullable=False, default="en")
    accessibility_needs = Column(Text, nullable=True)
    consent_status = Column(Boolean, nullable=False, default=True)
    recruitment_source = Column(String(120), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    interviews = relationship("MarketInterview", back_populates="participant", cascade="all, delete-orphan")
    baselines = relationship("ConsumerPlanningBaseline", back_populates="participant", cascade="all, delete-orphan")
