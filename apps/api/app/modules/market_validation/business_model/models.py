from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, JSON
from app.core.database import Base


class MarketBusinessModel(Base):
    __tablename__ = "market_business_models"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name = Column(String(100), nullable=False)
    customer_type = Column(String(50), nullable=False, index=True)
    value_proposition = Column(Text, nullable=False)
    revenue_model = Column(String(50), nullable=False, index=True)
    pricing_model = Column(String(100), nullable=True)
    payment_trigger = Column(String(100), nullable=True)
    cost_structure = Column(Text, nullable=True)
    assumptions = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default="EMERGING")
    evidence_strength = Column(String(50), nullable=False, default="MODERATE")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class MarketRevenueStream(Base):
    __tablename__ = "market_revenue_streams"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    business_model_id = Column(String(36), nullable=True, index=True)
    customer_type = Column(String(50), nullable=False, index=True)
    stream_type = Column(String(50), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    value_created = Column(Text, nullable=True)
    payment_trigger = Column(String(100), nullable=True)
    pricing_unit = Column(String(50), nullable=False)
    base_price = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    estimated_frequency = Column(String(50), nullable=True)
    estimated_conversion = Column(Float, nullable=False, default=0.0)
    estimated_margin = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="ACTIVE")
    evidence_strength = Column(String(50), nullable=False, default="MODERATE")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
