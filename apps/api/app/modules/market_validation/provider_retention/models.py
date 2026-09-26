from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON
from app.core.database import Base


class MarketProviderRetention(Base):
    __tablename__ = "market_provider_retention"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    provider_id = Column(String(36), nullable=False, unique=True, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    onboarded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    last_active_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    last_lead_at = Column(DateTime(timezone=True), nullable=True)
    last_lead_responded_at = Column(DateTime(timezone=True), nullable=True)
    last_listing_update_at = Column(DateTime(timezone=True), nullable=True)
    total_leads_received = Column(Integer, nullable=False, default=0)
    total_leads_responded = Column(Integer, nullable=False, default=0)
    total_bookings_managed = Column(Integer, nullable=False, default=0)
    listing_update_count = Column(Integer, nullable=False, default=0)
    reactivated_count = Column(Integer, nullable=False, default=0)
    continuation_status = Column(String(50), nullable=False, default="CONTINUOUS")
    supply_density_region = Column(String(50), nullable=True, default="BASTAR")
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
