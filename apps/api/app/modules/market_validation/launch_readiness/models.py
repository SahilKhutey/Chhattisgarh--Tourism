from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, JSON, String
from app.core.database import Base


class LaunchReadinessAssessment(Base):
    __tablename__ = "launch_readiness_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pilot_id = Column(String(36), nullable=False, index=True)
    product_ready = Column(Boolean, nullable=False, default=False)
    content_ready = Column(Boolean, nullable=False, default=False)
    geography_ready = Column(Boolean, nullable=False, default=False)
    supply_ready = Column(Boolean, nullable=False, default=False)
    consumer_ready = Column(Boolean, nullable=False, default=False)
    transaction_ready = Column(Boolean, nullable=False, default=False)
    analytics_ready = Column(Boolean, nullable=False, default=False)
    support_ready = Column(Boolean, nullable=False, default=False)
    security_ready = Column(Boolean, nullable=False, default=False)
    privacy_ready = Column(Boolean, nullable=False, default=False)
    safety_ready = Column(Boolean, nullable=False, default=False)
    operational_ready = Column(Boolean, nullable=False, default=False)
    blockers = Column(JSON, nullable=True)
    warnings = Column(JSON, nullable=True)
    overall_status = Column(String(50), nullable=False, default="NOT_READY")  # READY, BLOCKED, NOT_READY
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
