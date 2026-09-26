from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

from app.core.database import Base


class MarketProviderResponse(Base):
    __tablename__ = "market_provider_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(String(100), nullable=False, index=True)
    provider_id = Column(String(100), nullable=False, index=True)
    response_type = Column(String(50), nullable=False, default="RESPONDED")  # ACCEPT, DECLINE, QUESTION, QUOTE
    response_time_seconds = Column(Integer, nullable=False, default=0)
    response_bucket = Column(String(50), nullable=False, default="NO_RESPONSE")  # <5m, 5-30m, 30-120m, 2-24h, >24h, NO_RESPONSE
    response_message = Column(Text, nullable=True)
    offered_price = Column(Float, nullable=True)
    offered_date = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(JSON_TYPE, nullable=True)
    responded_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
