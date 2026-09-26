from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, String
from app.core.database import Base


class ExpansionCandidate(Base):
    __tablename__ = "expansion_candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    current_market_id = Column(String(100), nullable=False, index=True)
    candidate_market_id = Column(String(100), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False, default=0.0)
    demand_score = Column(Float, nullable=False, default=0.0)
    supply_score = Column(Float, nullable=False, default=0.0)
    geographic_fit = Column(Float, nullable=False, default=0.0)
    operational_fit = Column(Float, nullable=False, default=0.0)
    economic_fit = Column(Float, nullable=False, default=0.0)
    expansion_risk = Column(Float, nullable=False, default=0.0)
    recommendation = Column(String(100), nullable=False, default="RECOMMENDED_NEXT_EXPANSION")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
