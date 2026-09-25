from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketGeoMetric(Base):
    __tablename__ = "market_geo_metrics"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    region_id = Column(String(64), nullable=False, unique=True, index=True)
    total_destinations = Column(Integer, nullable=False, default=0)
    total_relationships = Column(Integer, nullable=False, default=0)
    validated_relationships = Column(Integer, nullable=False, default=0)
    nearby_planning_activation_rate = Column(Float, nullable=False, default=0.0)
    discovery_expansion_rate = Column(Float, nullable=False, default=0.0)
    route_conversion_rate = Column(Float, nullable=False, default=0.0)
    avg_planning_efficiency = Column(Float, nullable=False, default=0.0)
    geographic_utility_score = Column(Float, nullable=False, default=0.0)
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
