from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

from app.core.database import Base


class MarketDiscoveryEvent(Base):
    __tablename__ = "market_discovery_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    anonymous_user_id = Column(String(100), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    discovery_source = Column(String(50), nullable=False, index=True)
    content_entry_id = Column(String(100), nullable=True, index=True)
    destination_id = Column(String(100), nullable=True, index=True)
    experiment_id = Column(String(50), nullable=True, index=True)
    assigned_variant = Column(String(20), nullable=True)
    metadata_json = Column(JSON_TYPE, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
