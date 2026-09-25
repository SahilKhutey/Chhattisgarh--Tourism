from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketProviderListingExperiment(Base):
    __tablename__ = "market_provider_listing_experiments"

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
    template_id = Column(String(64), nullable=True)
    status = Column(String(32), nullable=False, default="DRAFT", index=True)
    information_score = Column(Integer, nullable=False, default=0)
    media_score = Column(Integer, nullable=False, default=0)
    location_score = Column(Integer, nullable=False, default=0)
    service_score = Column(Integer, nullable=False, default=0)
    contact_score = Column(Integer, nullable=False, default=0)
    trust_score = Column(Integer, nullable=False, default=0)
    listing_quality_score = Column(Integer, nullable=False, default=0)
    published_at = Column(DateTime(timezone=True), nullable=True)
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

    provider = relationship("MarketProvider", back_populates="listings")
