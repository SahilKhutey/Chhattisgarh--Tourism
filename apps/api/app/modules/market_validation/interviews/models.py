from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketInterview(Base):
    __tablename__ = "market_interviews"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    participant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_participants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    research_project = Column(String(120), nullable=False, default="CG_TOURISM_MV2")
    interviewer = Column(String(120), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    travel_context = Column(Text, nullable=True)
    destination = Column(String(120), nullable=True)
    transcript_status = Column(String(32), nullable=False, default="PLANNED", index=True)
    recording_consent = Column(Boolean, nullable=False, default=False)
    summary = Column(Text, nullable=True)
    key_findings = Column(JSON, nullable=True)
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

    participant = relationship("MarketParticipant", back_populates="interviews")
    problems = relationship("ConsumerProblem", back_populates="interview")
    evidence = relationship("ValidationEvidence", back_populates="interview")
