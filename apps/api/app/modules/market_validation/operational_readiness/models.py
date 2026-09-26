from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, JSON, String
from app.core.database import Base


class OperationalReadiness(Base):
    __tablename__ = "operational_readiness"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pilot_id = Column(String(36), nullable=False, index=True)
    support_capacity = Column(JSON, nullable=True)
    content_operations = Column(JSON, nullable=True)
    provider_operations = Column(JSON, nullable=True)
    technical_operations = Column(JSON, nullable=True)
    incident_response = Column(JSON, nullable=True)
    monitoring = Column(JSON, nullable=True)
    escalation = Column(JSON, nullable=True)
    founder_dependency_metrics = Column(JSON, nullable=True)
    readiness_status = Column(String(50), nullable=False, default="NOT_READY")  # READY, ATTENTION_REQUIRED, NOT_READY
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
