from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, JSON
from app.core.database import Base


class MarketPricingExperiment(Base):
    __tablename__ = "market_pricing_experiments"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    revenue_stream_id = Column(String(36), nullable=True, index=True)
    customer_type = Column(String(50), nullable=False, index=True)  # PROVIDER, CONSUMER, B2B
    experiment_type = Column(String(50), nullable=False, index=True)  # LEAD_FEE, COMMISSION, SUBSCRIPTION, DYNAMIC
    control_price = Column(Float, nullable=False)
    variant_prices = Column(JSON, nullable=False)  # e.g. {"A": 10.0, "B": 25.0, "C": 50.0}
    eligibility_rule = Column(String(100), nullable=True)
    start_at = Column(DateTime(timezone=True), nullable=True)
    end_at = Column(DateTime(timezone=True), nullable=True)
    primary_metric = Column(String(100), nullable=False, default="CONVERSION_RATE")
    secondary_metrics = Column(JSON, nullable=True)  # ["ARPU", "TOTAL_REVENUE", "REFUND_RATE"]
    status = Column(String(50), nullable=False, default="ACTIVE")  # ACTIVE, PAUSED, CONCLUDED
    decision = Column(String(50), nullable=False, default="INCONCLUSIVE")  # WINNER_CONTROL, WINNER_VARIANT_B, INCONCLUSIVE

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
