from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketConversion(Base):
    __tablename__ = "market_conversions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(String(100), nullable=False, index=True)
    booking_intent_id = Column(String(100), nullable=True, index=True)
    booking_id = Column(String(100), nullable=True, index=True)
    provider_id = Column(String(100), nullable=False, index=True)
    consumer_id = Column(String(100), nullable=True, index=True)
    conversion_stage = Column(String(50), nullable=False, index=True)  # CONTACT, QUALIFIED, BOOKING_INTENT, BOOKED, COMPLETED
    value = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    attributed_source = Column(String(50), nullable=False)
    experiment_id = Column(String(100), nullable=True)
    converted_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
