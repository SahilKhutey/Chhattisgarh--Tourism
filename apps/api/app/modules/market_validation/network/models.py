from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from app.core.database import Base


class MarketNetworkInteraction(Base):
    __tablename__ = "market_network_interactions"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    actor_type = Column(String(50), nullable=False, index=True)
    actor_id = Column(String(128), nullable=False, index=True)
    target_type = Column(String(50), nullable=False, index=True)
    target_id = Column(String(128), nullable=False, index=True)
    interaction_type = Column(String(50), nullable=False, index=True)
    session_id = Column(String(128), nullable=True)
    source = Column(String(50), nullable=True)
    geography = Column(String(50), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class MarketNetworkGap(Base):
    __tablename__ = "market_network_gaps"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    geography = Column(String(50), nullable=False, index=True)
    destination = Column(String(100), nullable=False, index=True)
    provider_supply_count = Column(Integer, nullable=False, default=0)
    content_supply_count = Column(Integer, nullable=False, default=0)
    traveler_demand_score = Column(Float, nullable=False, default=0.0)
    interaction_density = Column(Float, nullable=False, default=0.0)
    booking_activity = Column(Integer, nullable=False, default=0)
    retention_rate = Column(Float, nullable=False, default=0.0)
    opportunity_score = Column(Float, nullable=False, default=0.0)
    recommended_action = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
