from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime
from app.core.database import Base


class MarketBusinessExperimentObservation(Base):
    __tablename__ = "market_business_experiment_observations"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    experiment_id = Column(String(36), nullable=False, index=True)
    participant_id = Column(String(128), nullable=False, index=True)
    variant = Column(String(50), nullable=False)  # "A", "B", "CONTROL"
    offer = Column(String(100), nullable=True)
    observed_action = Column(String(50), nullable=False)  # VIEW, CLICK, CONTACT_ATTEMPT, PURCHASE, REJECT
    price = Column(Float, nullable=False, default=0.0)
    committed = Column(Boolean, nullable=False, default=False)
    paid = Column(Boolean, nullable=False, default=False)
    outcome = Column(String(100), nullable=True)
    evidence = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
