from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketProvider(Base):
    __tablename__ = "market_providers"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    canonical_provider_id = Column(UUID(as_uuid=True), nullable=True)
    provider_type = Column(String(64), nullable=False, index=True)
    segment = Column(String(64), nullable=False)
    business_name = Column(String(160), nullable=False)
    geography = Column(String(120), nullable=False, index=True)
    operating_area = Column(String(120), nullable=False)
    verification_status = Column(String(32), nullable=False, default="UNVERIFIED", index=True)
    digital_presence = Column(String(64), nullable=False, default="BASIC_DIGITAL")
    acquisition_channels = Column(JSON, nullable=False, default=list)
    booking_method = Column(String(64), nullable=False, default="WHATSAPP")
    response_method = Column(String(64), nullable=False, default="PHONE")
    current_demand = Column(String(64), nullable=False, default="LOW")
    desired_demand = Column(String(64), nullable=False, default="HIGH")
    willingness_to_participate = Column(Boolean, nullable=False, default=True)
    willingness_to_pay = Column(String(64), nullable=False, default="UNDECIDED")
    research_status = Column(String(32), nullable=False, default="PROSPECT")
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

    research = relationship("MarketProviderResearch", back_populates="provider", cascade="all, delete-orphan")
    onboarding = relationship("MarketProviderOnboarding", back_populates="provider", uselist=False, cascade="all, delete-orphan")
    listings = relationship("MarketProviderListingExperiment", back_populates="provider", cascade="all, delete-orphan")
    leads = relationship("MarketLead", back_populates="provider", cascade="all, delete-orphan")
    feedback = relationship("MarketProviderFeedback", back_populates="provider", cascade="all, delete-orphan")
    metrics = relationship("MarketProviderMetric", back_populates="provider", uselist=False, cascade="all, delete-orphan")


class MarketProviderResearch(Base):
    __tablename__ = "market_provider_research"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    provider_id = Column(
        UUID(as_uuid=True),
        ForeignKey("market_providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    researcher_id = Column(String(120), nullable=False)
    interview_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    acquisition_channels = Column(JSON, nullable=True)
    booking_channels = Column(JSON, nullable=True)
    operational_tools = Column(JSON, nullable=True)
    current_pain = Column(Text, nullable=False)
    desired_outcome = Column(Text, nullable=False)
    demand_problem = Column(Text, nullable=True)
    digital_problem = Column(Text, nullable=True)
    trust_problem = Column(Text, nullable=True)
    booking_problem = Column(Text, nullable=True)
    response_problem = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    provider = relationship("MarketProvider", back_populates="research")
