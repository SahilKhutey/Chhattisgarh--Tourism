from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, JSON, String
from app.core.database import Base


class ScaleGate(Base):
    __tablename__ = "scale_gates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pilot_id = Column(String(36), nullable=False, index=True)
    gate_name = Column(String(100), nullable=False, index=True)
    requirement = Column(String(255), nullable=False)
    metric = Column(String(100), nullable=False)
    threshold = Column(Float, nullable=False, default=0.0)
    actual_value = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="PENDING")  # PASSED, FAILED, PENDING
    blocker = Column(Boolean, nullable=False, default=True)
    evidence_ids = Column(JSON, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
