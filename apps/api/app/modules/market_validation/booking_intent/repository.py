from __future__ import annotations

from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.booking_intent.models import MarketBookingIntent


class BookingIntentRepository:
    def create(self, db: Session, intent: MarketBookingIntent) -> MarketBookingIntent:
        db.add(intent)
        db.commit()
        db.refresh(intent)
        return intent

    def get_by_id(self, db: Session, intent_id: UUID | str) -> MarketBookingIntent | None:
        if isinstance(intent_id, UUID):
            return db.get(MarketBookingIntent, intent_id)
        try:
            val_uuid = UUID(intent_id)
            intent = db.get(MarketBookingIntent, val_uuid)
            if intent:
                return intent
        except (ValueError, AttributeError):
            pass
        stmt = select(MarketBookingIntent).where(MarketBookingIntent.intent_id == str(intent_id))
        return db.execute(stmt).scalar_one_or_none()

    def get_by_idempotency_key(self, db: Session, key: str) -> MarketBookingIntent | None:
        stmt = select(MarketBookingIntent).where(MarketBookingIntent.idempotency_key == key)
        return db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        db: Session,
        provider_id: str | None = None,
        consumer_id: str | None = None,
        lead_id: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketBookingIntent]]:
        stmt = select(MarketBookingIntent)
        if provider_id:
            stmt = stmt.where(MarketBookingIntent.provider_id == provider_id)
        if consumer_id:
            stmt = stmt.where(MarketBookingIntent.consumer_id == consumer_id)
        if lead_id:
            stmt = stmt.where(MarketBookingIntent.lead_id == lead_id)
        if status:
            stmt = stmt.where(MarketBookingIntent.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketBookingIntent.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, intent: MarketBookingIntent) -> MarketBookingIntent:
        intent.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(intent)
        return intent
