from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

from app.core.database import Base


class MarketLead(Base):
    __tablename__ = "market_leads"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    provider_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # MV7 Canonical lead fields
    lead_id = Column(String(100), unique=True, nullable=True, index=True)
    consumer_id = Column(String(100), nullable=True, index=True)
    anonymous_user_id = Column(String(100), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    source = Column(String(64), nullable=False, default="SEARCH", index=True)
    destination_id = Column(String(100), nullable=True, index=True)
    experience_id = Column(String(100), nullable=True, index=True)
    traveler_segment = Column(String(64), nullable=True, default="GENERAL")
    destination = Column(String(120), nullable=True, default="Bastar")
    experience = Column(String(160), nullable=True, default="Local Guided Experience")
    request_type = Column(String(64), nullable=False, default="BOOKING_INQUIRY")
    requested_date = Column(DateTime(timezone=True), nullable=True)
    traveler_count = Column(Integer, nullable=False, default=1)
    budget_band = Column(String(50), nullable=True)
    message = Column(Text, nullable=True)
    
    # Qualification lifecycle
    status = Column(String(32), nullable=False, default="NEW", index=True)
    qualified = Column(Boolean, nullable=False, default=False, index=True)
    qualification_status = Column(String(50), nullable=False, default="PENDING", index=True)  # UNQUALIFIED, PENDING, QUALIFIED, DISQUALIFIED
    disqualification_reason = Column(String(100), nullable=True)
    
    # Provider response lifecycle
    provider_response_status = Column(String(50), nullable=False, default="NEW", index=True)  # NEW, VIEWED, ACCEPTED, CONTACTED, RESPONDED, NEGOTIATING, DECLINED, EXPIRED
    provider_response_at = Column(DateTime(timezone=True), nullable=True)
    response_time_seconds = Column(Integer, nullable=True)
    
    # Conversion & details
    conversion_status = Column(String(32), nullable=False, default="CONTACT", index=True)  # CONTACT, QUALIFIED, BOOKING_INTENT, BOOKED, COMPLETED
    outcome = Column(String(120), nullable=True)
    lead_details = Column(JSON_TYPE, nullable=True)

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

    provider = relationship("MarketProvider", back_populates="leads")
