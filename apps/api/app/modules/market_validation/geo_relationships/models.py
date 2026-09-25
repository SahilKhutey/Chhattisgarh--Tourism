from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketGeoRelationship(Base):
    __tablename__ = "market_geo_relationships"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    source_destination_id = Column(String(64), nullable=False, index=True)
    target_destination_id = Column(String(64), nullable=False, index=True)
    relationship_type = Column(String(64), nullable=False, index=True)
    straight_line_km = Column(Float, nullable=True)
    road_distance_km = Column(Float, nullable=True)
    estimated_travel_minutes = Column(Integer, nullable=True)
    validation_status = Column(String(32), nullable=False, default="PROVISIONAL", index=True)
    evidence_type = Column(String(64), nullable=False, default="GEOSPATIAL_CALCULATION")
    evidence_count = Column(Integer, nullable=False, default=1)
    confidence = Column(Float, nullable=False, default=0.8)
    source = Column(String(120), nullable=False, default="ROUTE_CALCULATION")
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
