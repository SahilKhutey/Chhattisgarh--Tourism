from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.willingness_to_pay.models import MarketWillingnessToPay
from app.modules.market_validation.willingness_to_pay.schemas import WillingnessToPayCreate


class WillingnessToPayRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_response(self, data: WillingnessToPayCreate) -> MarketWillingnessToPay:
        record = MarketWillingnessToPay(
            participant_type=data.participant_type,
            participant_id=data.participant_id,
            offer_id=data.offer_id,
            price=data.price,
            currency=data.currency,
            response_type=data.response_type,
            committed=data.committed,
            payment_attempted=data.payment_attempted,
            purchased=data.purchased,
            rejected_reason=data.rejected_reason,
            experiment_id=data.experiment_id,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_response(self, record_id: str) -> MarketWillingnessToPay | None:
        return self.db.query(MarketWillingnessToPay).filter(MarketWillingnessToPay.id == record_id).first()

    def list_responses(
        self,
        participant_type: str | None = None,
        offer_id: str | None = None,
        response_type: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketWillingnessToPay]:
        query = self.db.query(MarketWillingnessToPay)
        if participant_type:
            query = query.filter(MarketWillingnessToPay.participant_type == participant_type)
        if offer_id:
            query = query.filter(MarketWillingnessToPay.offer_id == offer_id)
        if response_type:
            query = query.filter(MarketWillingnessToPay.response_type == response_type)
        return query.order_by(MarketWillingnessToPay.created_at.desc()).offset(offset).limit(limit).all()
