from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketContentEntry(Base):
    __tablename__ = "market_content_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(String(100), unique=True, nullable=False, index=True)
    content_type = Column(String(50), nullable=False, index=True)  # DESTINATION, PLACE, EXPERIENCE, FESTIVAL, CULTURAL_STORY, FOOD, ACCOMMODATION, ROUTE
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    destination_id = Column(String(100), nullable=True, index=True)
    short_description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    language = Column(String(10), nullable=False, default="en", index=True)
    fields_json = Column(JSON_TYPE, nullable=True)
    quality_score = Column(Float, nullable=False, default=0.0)
    quality_breakdown = Column(JSON_TYPE, nullable=True)
    governance_status = Column(String(50), nullable=False, default="CONTENT_DRAFT", index=True)  # CONTENT_DRAFT, CONTENT_REVIEW, CONTENT_VERIFIED, CONTENT_PUBLISHED, CONTENT_STALE, CONTENT_ARCHIVED
    last_verified_at = Column(DateTime(timezone=True), nullable=True)
    next_review_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    evidence_items = relationship("MarketContentEvidence", back_populates="content_entry", cascade="all, delete-orphan")
    trust_record = relationship("MarketContentTrust", back_populates="content_entry", uselist=False, cascade="all, delete-orphan")
