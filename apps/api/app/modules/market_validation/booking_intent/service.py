from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.booking_intent.models import MarketBookingIntent
from app.modules.market_validation.booking_intent.schemas import (
    BookingIntentCreate,
    BookingIntentUpdate,
    BookingIntentConfirmRequest,
    BookingIntentCancelRequest,
)
from app.modules.market_validation.booking_intent.repository import BookingIntentRepository


class BookingIntentService:
    def __init__(self, repo: BookingIntentRepository | None = None):
        self.repo = repo or BookingIntentRepository()

    def create_intent(
        self,
        db: Session,
        payload: BookingIntentCreate,
        idempotency_key: str | None = None,
    ) -> MarketBookingIntent:
        key = idempotency_key or payload.idempotency_key
        if key:
            existing = self.repo.get_by_idempotency_key(db, key)
            if existing:
                return existing

        now = datetime.now(timezone.utc)
        intent = MarketBookingIntent(
            id=uuid.uuid4(),
            intent_id=f"BINT_{uuid.uuid4().hex[:12].upper()}",
            lead_id=payload.lead_id,
            consumer_id=payload.consumer_id,
            provider_id=payload.provider_id,
            experience_id=payload.experience_id,
            requested_date=payload.requested_date,
            traveler_count=payload.traveler_count,
            amount_estimate=payload.amount_estimate,
            currency=payload.currency,
            status="REQUESTED",
            idempotency_key=key,
            intent_details=payload.intent_details,
            created_at=now,
            updated_at=now,
        )
        return self.repo.create(db, intent)

    def get_intent(self, db: Session, intent_id: str) -> MarketBookingIntent:
        intent = self.repo.get_by_id(db, intent_id)
        if not intent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking intent {intent_id} not found.",
            )
        return intent

    def list_intents(
        self,
        db: Session,
        provider_id: str | None = None,
        consumer_id: str | None = None,
        lead_id: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketBookingIntent]]:
        return self.repo.list(
            db,
            provider_id=provider_id,
            consumer_id=consumer_id,
            lead_id=lead_id,
            status=status,
            limit=limit,
            offset=offset,
        )

    def update_intent(
        self,
        db: Session,
        intent_id: str,
        payload: BookingIntentUpdate,
    ) -> MarketBookingIntent:
        intent = self.get_intent(db, intent_id)
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(intent, key, value)
        return self.repo.update(db, intent)

    def confirm_intent(
        self,
        db: Session,
        intent_id: str,
        payload: BookingIntentConfirmRequest,
    ) -> MarketBookingIntent:
        intent = self.get_intent(db, intent_id)
        if payload.confirmed_price is not None:
            intent.amount_estimate = payload.confirmed_price

        if payload.role == "PROVIDER":
            intent.status = "PROVIDER_CONFIRMED"
        elif payload.role == "CONSUMER":
            intent.status = "BOOKED"
        else:
            intent.status = "BOOKED"

        return self.repo.update(db, intent)

    def cancel_intent(
        self,
        db: Session,
        intent_id: str,
        payload: BookingIntentCancelRequest,
    ) -> MarketBookingIntent:
        intent = self.get_intent(db, intent_id)
        intent.status = "CANCELLED"
        if not intent.intent_details:
            intent.intent_details = {}
        intent.intent_details["cancellation_reason"] = payload.cancellation_reason
        intent.intent_details["cancellation_notes"] = payload.notes
        return self.repo.update(db, intent)
