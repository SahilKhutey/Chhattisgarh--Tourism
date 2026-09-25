from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ConsumerProblem(Base):
    __tablename__ = "consumer_problems"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    participant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_participants.id", ondelete="SET NULL"),
        nullable=True,
    )
    interview_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_interviews.id", ondelete="SET NULL"),
        nullable=True,
    )
    journey_stage = Column(String(64), nullable=False, index=True)
    problem_statement = Column(Text, nullable=False)
    current_behavior = Column(Text, nullable=False)
    workaround = Column(Text, nullable=False)
    frequency = Column(Integer, nullable=False, default=3)
    severity = Column(Integer, nullable=False, default=3)
    emotional_cost = Column(Integer, nullable=False, default=3)
    financial_cost = Column(Integer, nullable=False, default=1)
    time_cost = Column(Integer, nullable=False, default=3)
    trust_impact = Column(Integer, nullable=False, default=3)
    pain_score = Column(Integer, nullable=False, default=81, index=True)
    evidence_strength = Column(String(64), nullable=False)
    affected_segment = Column(String(64), nullable=True)
    affected_geography = Column(String(120), nullable=True)
    related_jtbd = Column(String(64), nullable=True, index=True)
    cluster_tag = Column(String(120), nullable=True, index=True)
    status = Column(String(32), nullable=False, default="UNTESTED")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    participant = relationship("MarketParticipant")
    interview = relationship("MarketInterview", back_populates="problems")
    evidence = relationship("ValidationEvidence", back_populates="problem")
