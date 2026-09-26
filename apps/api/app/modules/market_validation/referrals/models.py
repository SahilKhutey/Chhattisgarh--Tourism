from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from app.core.database import Base


class MarketReferral(Base):
    __tablename__ = "market_referrals"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    referrer_id = Column(String(128), nullable=False, index=True)
    referral_code = Column(String(64), nullable=False, unique=True, index=True)
    referral_channel = Column(String(50), nullable=False, default="LINK")
    trip_id = Column(String(64), nullable=True)
    destination_id = Column(String(64), nullable=True)
    context_type = Column(String(50), nullable=False, default="TRIP")
    recipient_anonymous_id = Column(String(128), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="CREATED")
    first_visit_at = Column(DateTime(timezone=True), nullable=True)
    activated_at = Column(DateTime(timezone=True), nullable=True)
    trip_created_at = Column(DateTime(timezone=True), nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
