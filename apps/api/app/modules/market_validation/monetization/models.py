from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, JSON
from app.core.database import Base


class MarketMonetizationOffer(Base):
    __tablename__ = "market_monetization_offers"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    revenue_stream_id = Column(String(36), nullable=True, index=True)
    target_type = Column(String(50), nullable=False, index=True)  # PROVIDER, CONSUMER, INSTITUTION
    target_id = Column(String(128), nullable=True)
    offer_title = Column(String(150), nullable=False)
    offer_description = Column(Text, nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    billing_cycle = Column(String(50), nullable=False, default="ONE_TIME")
    features = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class MarketMonetizationOrder(Base):
    __tablename__ = "market_monetization_orders"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    offer_id = Column(String(36), nullable=False, index=True)
    customer_type = Column(String(50), nullable=False, index=True)
    customer_id = Column(String(128), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    status = Column(String(50), nullable=False, default="INITIATED", index=True)
    idempotency_key = Column(String(128), nullable=True, unique=True, index=True)
    variable_cost = Column(Float, nullable=False, default=0.0)
    contribution_margin = Column(Float, nullable=False, default=0.0)
    refund_amount = Column(Float, nullable=False, default=0.0)
    refund_reason = Column(String(255), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class MarketMonetizationPolicy(Base):
    __tablename__ = "market_monetization_policies"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    revenue_model = Column(String(50), nullable=False, index=True)
    eligible_surface = Column(String(100), nullable=False)
    ranking_influence = Column(String(50), nullable=False, default="NONE")
    disclosure_required = Column(Boolean, nullable=False, default=True)
    user_impact = Column(String(255), nullable=True)
    trust_risk = Column(Float, nullable=False, default=0.0)
    approval_status = Column(String(50), nullable=False, default="APPROVED")
    approved_by = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
