from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

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
    source = Column(String(64), nullable=False, default="DISCOVERY")
    traveler_segment = Column(String(64), nullable=False)
    destination = Column(String(120), nullable=False)
    experience = Column(String(160), nullable=False)
    request_type = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False, default="NEW", index=True)
    qualified = Column(Boolean, nullable=False, default=False, index=True)
    conversion_status = Column(String(32), nullable=False, default="PENDING")
    outcome = Column(String(120), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    provider_response_at = Column(DateTime(timezone=True), nullable=True)
    response_time_seconds = Column(Integer, nullable=True)

    provider = relationship("MarketProvider", back_populates="leads")
