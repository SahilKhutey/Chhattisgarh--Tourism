from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketContentEvidence(Base):
    __tablename__ = "market_content_evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_entry_id = Column(UUID(as_uuid=True), ForeignKey("market_content_entries.id", ondelete="CASCADE"), nullable=False, index=True)
    claim = Column(Text, nullable=False)
    field_name = Column(String(100), nullable=True)
    source_type = Column(String(50), nullable=False, index=True)
    source_reference = Column(String(255), nullable=True)
    observed_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verifier = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=False, default=0.8)
    status = Column(String(50), nullable=False, default="UNVERIFIED", index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    content_entry = relationship("MarketContentEntry", back_populates="evidence_items")
