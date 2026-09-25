from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ValidationEvidence(Base):
    __tablename__ = "validation_evidence"

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
    interview_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_interviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    problem_id = Column(
        UUID(as_uuid=True),
        ForeignKey("consumer_problems.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    jtbd_id = Column(String(64), nullable=True, index=True)
    evidence_type = Column(String(64), nullable=False, index=True)
    observation = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    researcher_confidence = Column(Integer, nullable=False, default=3)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    participant = relationship("MarketParticipant")
    interview = relationship("MarketInterview", back_populates="evidence")
    problem = relationship("ConsumerProblem", back_populates="evidence")
