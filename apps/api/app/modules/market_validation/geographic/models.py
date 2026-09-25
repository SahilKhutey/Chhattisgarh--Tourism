from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketGeoValidation(Base):
    __tablename__ = "market_geo_validation"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    region_id = Column(String(64), nullable=False, index=True)
    zone_id = Column(String(64), nullable=True)
    destination_id = Column(String(64), nullable=False, unique=True, index=True)
    destination_name = Column(String(160), nullable=False)
    district = Column(String(64), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    tourism_type = Column(String(64), nullable=False, default="GENERAL")
    validation_status = Column(String(32), nullable=False, default="PROVISIONAL", index=True)
    evidence_count = Column(Integer, nullable=False, default=1)
    confidence = Column(Float, nullable=False, default=0.8)
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
