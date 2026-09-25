from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketRouteValidation(Base):
    __tablename__ = "market_route_validation"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    origin = Column(String(120), nullable=False)
    destination = Column(String(120), nullable=False)
    intermediate_places = Column(JSON, nullable=True, default=list)
    estimated_duration_minutes = Column(Integer, nullable=False)
    actual_or_user_estimate_minutes = Column(Integer, nullable=True)
    travel_mode = Column(String(32), nullable=False, default="CAR")
    feasibility = Column(String(32), nullable=False, default="FEASIBLE")
    participant_id = Column(UUID(as_uuid=True), nullable=True)
    evidence = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
