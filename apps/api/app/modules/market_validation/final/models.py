from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text
from app.core.database import Base


class MarketValidationEvidenceSnapshot(Base):
    __tablename__ = "market_validation_evidence_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    version = Column(Integer, nullable=False, default=1)

    mv1_status = Column(String(50), nullable=False, default="VALIDATED")
    mv2_status = Column(String(50), nullable=False, default="VALIDATED")
    mv3_status = Column(String(50), nullable=False, default="VALIDATED")
    mv4_status = Column(String(50), nullable=False, default="VALIDATED")
    mv5_status = Column(String(50), nullable=False, default="VALIDATED")
    mv6_status = Column(String(50), nullable=False, default="VALIDATED")
    mv7_status = Column(String(50), nullable=False, default="VALIDATED")
    mv8_status = Column(String(50), nullable=False, default="VALIDATED")
    mv9_status = Column(String(50), nullable=False, default="VALIDATED")
    mv10_status = Column(String(50), nullable=False, default="VALIDATED")
    mv11_status = Column(String(50), nullable=False, default="VALIDATED")
    mv12_status = Column(String(50), nullable=False, default="VALIDATED")

    evidence_count = Column(Integer, nullable=False, default=0)
    strong_evidence_count = Column(Integer, nullable=False, default=0)
    contradictory_evidence_count = Column(Integer, nullable=False, default=0)

    consumer_evidence = Column(JSON, nullable=True)
    supply_evidence = Column(JSON, nullable=True)
    geographic_evidence = Column(JSON, nullable=True)
    content_evidence = Column(JSON, nullable=True)
    transaction_evidence = Column(JSON, nullable=True)
    retention_evidence = Column(JSON, nullable=True)
    economic_evidence = Column(JSON, nullable=True)
    operational_evidence = Column(JSON, nullable=True)

    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    generated_by = Column(String(128), nullable=False, default="SYSTEM")


class MarketValidationDecision(Base):
    __tablename__ = "market_validation_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    version = Column(Integer, nullable=False, default=1)
    decision = Column(String(50), nullable=False)  # GO, CONDITIONAL_GO, CONTINUE_VALIDATION, PIVOT, NO_GO
    rationale = Column(Text, nullable=False)
    evidence_snapshot_id = Column(String(36), nullable=False, index=True)
    policy_version = Column(String(50), nullable=False, default="1.0.0")
    gate_snapshot = Column(JSON, nullable=True)
    risk_snapshot = Column(JSON, nullable=True)
    contradiction_snapshot = Column(JSON, nullable=True)
    unknowns_snapshot = Column(JSON, nullable=True)
    recommendation_scope = Column(JSON, nullable=True)
    confidence = Column(String(50), nullable=False, default="HIGH")
    approved_by = Column(String(128), nullable=False, default="EXECUTIVE_COMMITTEE")
    decided_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class MarketValidationRisk(Base):
    __tablename__ = "market_validation_risks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    probability = Column(Float, nullable=False, default=0.0)
    impact = Column(Float, nullable=False, default=0.0)
    severity = Column(String(50), nullable=False, default="MEDIUM")
    mitigation = Column(Text, nullable=False)
    owner = Column(String(100), nullable=False, default="PRODUCT_LEAD")
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, MITIGATING, ACCEPTED, RESOLVED, BLOCKED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
