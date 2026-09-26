from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.core.database import Base


class MarketUnitEconomics(Base):
    __tablename__ = "market_unit_economics"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    segment = Column(String(50), nullable=False, index=True)  # PROVIDER, CONSUMER, B2B
    period = Column(String(50), nullable=False)  # e.g. "2026-Q3", "PILOT-1"
    spend = Column(Float, nullable=False, default=0.0)
    acquired_users = Column(Integer, nullable=False, default=0)
    activated_users = Column(Integer, nullable=False, default=0)
    paying_users = Column(Integer, nullable=False, default=0)
    cac = Column(Float, nullable=False, default=0.0)
    activated_cac = Column(Float, nullable=False, default=0.0)
    arpu = Column(Float, nullable=False, default=0.0)
    variable_cost_per_user = Column(Float, nullable=False, default=0.0)
    contribution_margin = Column(Float, nullable=False, default=0.0)
    expected_lifespan_cycles = Column(Float, nullable=False, default=1.0)
    ltv = Column(Float, nullable=False, default=0.0)
    ltv_cac_ratio = Column(Float, nullable=False, default=0.0)
    payback_period_months = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
