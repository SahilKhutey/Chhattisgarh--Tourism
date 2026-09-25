from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketProviderMetric(Base):
    __tablename__ = "market_provider_metrics"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    provider_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_providers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    impressions = Column(Integer, nullable=False, default=0)
    profile_views = Column(Integer, nullable=False, default=0)
    contacts = Column(Integer, nullable=False, default=0)
    qualified_leads = Column(Integer, nullable=False, default=0)
    bookings = Column(Integer, nullable=False, default=0)
    completed_services = Column(Integer, nullable=False, default=0)
    estimated_revenue = Column(Float, nullable=False, default=0.0)
    time_saved = Column(Integer, nullable=False, default=0)
    response_time_avg_seconds = Column(Integer, nullable=False, default=0)
    perceived_value = Column(String(64), nullable=False, default="MODERATE")
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

    provider = relationship("MarketProvider", back_populates="metrics")
