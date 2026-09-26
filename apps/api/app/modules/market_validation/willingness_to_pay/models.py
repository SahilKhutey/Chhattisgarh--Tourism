from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime
from app.core.database import Base


class MarketWillingnessToPay(Base):
    __tablename__ = "market_willingness_to_pay"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    participant_type = Column(String(50), nullable=False, index=True)  # PROVIDER, CONSUMER, B2B
    participant_id = Column(String(128), nullable=False, index=True)
    offer_id = Column(String(64), nullable=True, index=True)
    price = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    response_type = Column(String(50), nullable=False, default="INTERESTED")  # INTERESTED, COMMITTED, PAYMENT_ATTEMPTED, PURCHASED, REJECTED
    committed = Column(Boolean, nullable=False, default=False)
    payment_attempted = Column(Boolean, nullable=False, default=False)
    purchased = Column(Boolean, nullable=False, default=False)
    rejected_reason = Column(String(255), nullable=True)
    experiment_id = Column(String(36), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
