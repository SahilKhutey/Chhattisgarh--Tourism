from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketTransaction(Base):
    __tablename__ = "market_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    booking_id = Column(String(100), nullable=False, index=True)
    provider_id = Column(String(100), nullable=False, index=True)
    consumer_id = Column(String(100), nullable=True, index=True)
    gross_amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR")
    completion_status = Column(String(50), nullable=False, default="SCHEDULED", index=True)  # SCHEDULED, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED, DISPUTED
    provider_confirmed = Column(Boolean, nullable=False, default=False)
    consumer_confirmed = Column(Boolean, nullable=False, default=False)
    failure_reason = Column(String(50), nullable=True)  # NO_PROVIDER_RESPONSE, NO_AVAILABILITY, PRICE_MISMATCH, etc.
    idempotency_key = Column(String(100), unique=True, nullable=True, index=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)


class MarketTransactionFeedback(Base):
    __tablename__ = "market_transaction_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(String(100), nullable=False, index=True)
    provider_id = Column(String(100), nullable=False, index=True)
    consumer_id = Column(String(100), nullable=True, index=True)
    feedback_type = Column(String(50), nullable=False)  # PROVIDER_FEEDBACK, CONSUMER_FEEDBACK
    lead_quality_score = Column(Float, nullable=True)  # 1 to 5 or 0 to 100
    relevance_score = Column(Float, nullable=True)
    operational_effort_score = Column(Float, nullable=True)
    economic_value_score = Column(Float, nullable=True)
    continuation_intent = Column(Boolean, nullable=True)
    satisfaction_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
