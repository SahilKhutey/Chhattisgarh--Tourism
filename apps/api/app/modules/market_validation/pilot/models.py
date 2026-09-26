from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.core.database import Base


class ValidationPilot(Base):
    __tablename__ = "validation_pilots"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name = Column(String(150), nullable=False)
    validation_decision_id = Column(String(36), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="DRAFT", index=True)
    version = Column(Integer, nullable=False, default=1)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    geography_scope = Column(JSON, nullable=True)
    consumer_segments = Column(JSON, nullable=True)
    provider_segments = Column(JSON, nullable=True)
    destination_ids = Column(JSON, nullable=True)
    provider_ids = Column(JSON, nullable=True)
    experience_ids = Column(JSON, nullable=True)
    product_scope = Column(JSON, nullable=True)
    success_metrics = Column(JSON, nullable=True)
    failure_metrics = Column(JSON, nullable=True)
    minimum_sample = Column(Integer, nullable=False, default=50)
    target_sample = Column(Integer, nullable=False, default=200)
    budget_band = Column(String(50), nullable=False, default="PILOT_TIER_1")
    operational_capacity = Column(JSON, nullable=True)
    launch_owner = Column(String(100), nullable=False, default="PRODUCT_LEADER")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class PilotCohort(Base):
    __tablename__ = "pilot_cohorts"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    pilot_id = Column(String(36), nullable=False, index=True)
    cohort_name = Column(String(100), nullable=False)
    acquisition_channel = Column(String(50), nullable=False)
    consumer_segment = Column(String(50), nullable=False)
    geography = Column(String(100), nullable=False)
    language = Column(String(20), nullable=False, default="hi")
    device = Column(String(50), nullable=False, default="MOBILE")
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    users = Column(Integer, nullable=False, default=0)
    activated_users = Column(Integer, nullable=False, default=0)
    planners = Column(Integer, nullable=False, default=0)
    leads = Column(Integer, nullable=False, default=0)
    bookings = Column(Integer, nullable=False, default=0)
    completed_experiences = Column(Integer, nullable=False, default=0)
    returning_users = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class PilotAuditEvent(Base):
    __tablename__ = "pilot_audit_events"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    pilot_id = Column(String(36), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    actor_id = Column(String(128), nullable=False)
    actor_role = Column(String(50), nullable=False)
    details = Column(JSON, nullable=True)

    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
