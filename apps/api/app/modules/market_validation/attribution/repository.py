from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.modules.market_validation.attribution.models import MarketAttribution


class AttributionRepository:
    def create(self, db: Session, attribution: MarketAttribution) -> MarketAttribution:
        db.add(attribution)
        db.commit()
        db.refresh(attribution)
        return attribution

    def get_by_booking_id(self, db: Session, booking_id: str) -> MarketAttribution | None:
        stmt = (
            select(MarketAttribution)
            .where(MarketAttribution.booking_id == booking_id)
            .order_by(desc(MarketAttribution.created_at))
        )
        return db.execute(stmt).scalars().first()

    def get_by_lead_id(self, db: Session, lead_id: str) -> MarketAttribution | None:
        stmt = (
            select(MarketAttribution)
            .where(MarketAttribution.lead_id == lead_id)
            .order_by(desc(MarketAttribution.created_at))
        )
        return db.execute(stmt).scalars().first()
