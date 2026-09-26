from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketContentTrust(Base):
    __tablename__ = "market_content_trust"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_entry_id = Column(UUID(as_uuid=True), ForeignKey("market_content_entries.id", ondelete="CASCADE"), nullable=False, unique=True)
    source_count = Column(Integer, nullable=False, default=0)
    verified_sources = Column(Integer, nullable=False, default=0)
    freshness_score = Column(Float, nullable=False, default=0.0)
    contradiction_count = Column(Integer, nullable=False, default=0)
    provider_confirmation = Column(Boolean, nullable=False, default=False)
    community_confirmation = Column(Boolean, nullable=False, default=False)
    trust_score = Column(Float, nullable=False, default=0.0)
    trust_breakdown = Column(JSON_TYPE, nullable=True)
    last_computed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    content_entry = relationship("MarketContentEntry", back_populates="trust_record")
