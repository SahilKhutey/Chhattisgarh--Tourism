from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class JTBDValidation(Base):
    __tablename__ = "jtbd_validations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    jtbd_key = Column(String(32), unique=True, nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(32), nullable=False, default="UNTESTED")
    total_interviews_evaluated = Column(Integer, nullable=False, default=0)
    supporting_interviews_count = Column(Integer, nullable=False, default=0)
    direct_behavior_count = Column(Integer, nullable=False, default=0)
    observed_workaround_count = Column(Integer, nullable=False, default=0)
    confidence_score = Column(Float, nullable=False, default=0.0)
    evidence_summary = Column(Text, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
