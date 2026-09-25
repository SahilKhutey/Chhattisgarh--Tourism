from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ConsumerPlanningBaseline(Base):
    __tablename__ = "consumer_planning_baselines"

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
    task_id = Column(String(120), nullable=False, default="TASK_BASTAR_3DAY_PLAN")
    completion_status = Column(String(32), nullable=False, default="COMPLETED")
    duration_seconds = Column(Integer, nullable=False)
    tools_used = Column(JSON, nullable=False, default=list)
    searches_count = Column(Integer, nullable=False, default=0)
    manual_steps = Column(Integer, nullable=False, default=0)
    unresolved_questions = Column(JSON, nullable=True)
    confidence_score = Column(Integer, nullable=False, default=3)
    researcher_notes = Column(Text, nullable=True)
    workflow_fragmentation_score = Column(Integer, nullable=False, default=1)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    participant = relationship("MarketParticipant", back_populates="baselines")
