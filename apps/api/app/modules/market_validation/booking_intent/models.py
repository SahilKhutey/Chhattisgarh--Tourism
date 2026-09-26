from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

from app.core.database import Base


class MarketBookingIntent(Base):
    __tablename__ = "market_booking_intents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intent_id = Column(String(100), unique=True, nullable=False, index=True)
    lead_id = Column(String(100), nullable=False, index=True)
    consumer_id = Column(String(100), nullable=True, index=True)
    provider_id = Column(String(100), nullable=False, index=True)
    experience_id = Column(String(100), nullable=True, index=True)
    requested_date = Column(DateTime(timezone=True), nullable=True)
    traveler_count = Column(Integer, nullable=False, default=1)
    amount_estimate = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    status = Column(String(50), nullable=False, default="REQUESTED", index=True)  # REQUESTED, PROVIDER_CONFIRMED, CONSUMER_CONFIRMED, PAYMENT_PENDING, BOOKED, CANCELLED, EXPIRED
    idempotency_key = Column(String(100), unique=True, nullable=True, index=True)
    intent_details = Column(JSON_TYPE, nullable=True)
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
