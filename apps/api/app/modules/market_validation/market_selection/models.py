from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, JSON, String
from app.core.database import Base


class MarketCandidate(Base):
    __tablename__ = "market_candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    geography_id = Column(String(100), nullable=False, index=True)
    demand_score = Column(Float, nullable=False, default=0.0)
    supply_score = Column(Float, nullable=False, default=0.0)
    content_score = Column(Float, nullable=False, default=0.0)
    geographic_score = Column(Float, nullable=False, default=0.0)
    accessibility_score = Column(Float, nullable=False, default=0.0)
    operational_score = Column(Float, nullable=False, default=0.0)
    risk_score = Column(Float, nullable=False, default=0.0)
    evidence_strength = Column(String(50), nullable=False, default="MODERATE")
    pilot_priority = Column(Integer, nullable=False, default=1)
    recommendation = Column(String(100), nullable=False, default="RECOMMENDED_PILOT")
    evidence_ids = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
