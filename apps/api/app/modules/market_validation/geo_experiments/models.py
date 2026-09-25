from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MarketGeoExperiment(Base):
    __tablename__ = "market_geo_experiments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    experiment_key = Column(String(64), nullable=False, unique=True, index=True)
    name = Column(String(160), nullable=False)
    hypothesis_key = Column(String(64), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="RUNNING")
    control_description = Column(Text, nullable=False)
    variant_description = Column(Text, nullable=False)
    primary_metric_name = Column(String(64), nullable=False)
    control_metric_value = Column(Float, nullable=False, default=0.0)
    variant_metric_value = Column(Float, nullable=False, default=0.0)
    sample_size_control = Column(Integer, nullable=False, default=0)
    sample_size_variant = Column(Integer, nullable=False, default=0)
    statistical_significance = Column(Float, nullable=True)
    outcome = Column(String(120), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class MarketGeoObservation(Base):
    __tablename__ = "market_geo_observations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    participant_id = Column(UUID(as_uuid=True), nullable=True)
    task_id = Column(String(64), nullable=False, index=True)
    source_place_id = Column(String(64), nullable=True)
    target_place_id = Column(String(64), nullable=True)
    relationship_type = Column(String(64), nullable=False, index=True)
    expected_relationship = Column(String(64), nullable=True)
    observed_behavior = Column(Text, nullable=False)
    successful = Column(Boolean, nullable=False, default=True)
    difficulty = Column(Integer, nullable=False, default=2)
    confidence = Column(Float, nullable=False, default=0.8)
    evidence_type = Column(String(64), nullable=False, default="USER_OBSERVATION")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
