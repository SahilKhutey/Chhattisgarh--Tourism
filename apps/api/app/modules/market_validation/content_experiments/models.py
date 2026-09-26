from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketContentExperiment(Base):
    __tablename__ = "market_content_experiments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_key = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hypothesis_key = Column(String(50), nullable=False, index=True)
    content_entry_id = Column(String(100), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="DRAFT", index=True)
    control_version = Column(JSON_TYPE, nullable=False)
    variant_version = Column(JSON_TYPE, nullable=False)
    audience = Column(String(100), nullable=False, default="ALL_TRAVELERS")
    primary_metric = Column(String(100), nullable=False)
    secondary_metrics = Column(JSON_TYPE, nullable=True)
    control_metric_value = Column(Float, nullable=False, default=0.0)
    variant_metric_value = Column(Float, nullable=False, default=0.0)
    sample_size_control = Column(Integer, nullable=False, default=0)
    sample_size_variant = Column(Integer, nullable=False, default=0)
    lift_percentage = Column(Float, nullable=False, default=0.0)
    outcome = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    assignments = relationship("MarketContentAssignment", back_populates="experiment", cascade="all, delete-orphan")


class MarketContentAssignment(Base):
    __tablename__ = "market_content_assignments"
    __table_args__ = (
        UniqueConstraint("experiment_id", "anonymous_user_id", name="uq_experiment_user_assignment"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(UUID(as_uuid=True), ForeignKey("market_content_experiments.id", ondelete="CASCADE"), nullable=False, index=True)
    anonymous_user_id = Column(String(100), nullable=False, index=True)
    assigned_variant = Column(String(20), nullable=False)  # CONTROL or VARIANT
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    experiment = relationship("MarketContentExperiment", back_populates="assignments")
