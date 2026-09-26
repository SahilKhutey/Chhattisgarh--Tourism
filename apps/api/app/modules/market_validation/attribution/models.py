from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

from app.core.database import Base


class MarketAttribution(Base):
    __tablename__ = "market_attributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(String(100), nullable=False, index=True)
    lead_id = Column(String(100), nullable=False, index=True)
    anonymous_user_id = Column(String(100), nullable=True)
    session_id = Column(String(100), nullable=True)
    source_event_id = Column(String(100), nullable=True)
    discovery_source = Column(String(50), nullable=False, default="SEARCH")  # SEARCH, DESTINATION, MAP, NEARBY, EXPERIENCE, etc.
    destination_id = Column(String(100), nullable=True)
    experience_id = Column(String(100), nullable=True)
    provider_id = Column(String(100), nullable=False, index=True)
    campaign_id = Column(String(100), nullable=True)
    experiment_id = Column(String(100), nullable=True)
    attribution_window_days = Column(Integer, nullable=False, default=30)
    chain_details = Column(JSON_TYPE, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
