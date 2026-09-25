from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketProviderFeedback(Base):
    __tablename__ = "market_provider_feedback"

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
    journey = Column(String(64), nullable=False)
    feature = Column(String(64), nullable=False)
    sentiment = Column(String(32), nullable=False, default="NEUTRAL")
    problem = Column(Text, nullable=True)
    value = Column(Text, nullable=True)
    difficulty = Column(Integer, nullable=False, default=3)
    willingness_to_continue = Column(Boolean, nullable=False, default=True)
    willingness_to_pay = Column(String(64), nullable=True)
    free_text = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    provider = relationship("MarketProvider", back_populates="feedback")
