from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketProviderOnboarding(Base):
    __tablename__ = "market_provider_onboarding"

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
    current_step = Column(Integer, nullable=False, default=1)
    status = Column(String(32), nullable=False, default="STARTED")
    started_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    completion_rate = Column(Float, nullable=False, default=0.14)
    required_fields_completed = Column(Boolean, nullable=False, default=False)
    questions_asked = Column(JSON, nullable=True)
    time_to_onboard_seconds = Column(Integer, nullable=True)

    provider = relationship("MarketProvider", back_populates="onboarding")
