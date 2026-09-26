from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.monetization.models import (
    MarketMonetizationOffer,
    MarketMonetizationOrder,
    MarketMonetizationPolicy,
)
from app.modules.market_validation.monetization.schemas import (
    OfferCreate,
    OrderCreate,
)


class MonetizationRepository:
    def __init__(self, db: Session):
        self.db = db

    # Offers
    def create_offer(self, data: OfferCreate) -> MarketMonetizationOffer:
        offer = MarketMonetizationOffer(
            revenue_stream_id=data.revenue_stream_id,
            target_type=data.target_type,
            target_id=data.target_id,
            offer_title=data.offer_title,
            offer_description=data.offer_description,
            price=data.price,
            currency=data.currency,
            billing_cycle=data.billing_cycle,
            features=data.features,
            status=data.status,
        )
        self.db.add(offer)
        self.db.commit()
        self.db.refresh(offer)
        return offer

    def get_offer(self, offer_id: str) -> MarketMonetizationOffer | None:
        return self.db.query(MarketMonetizationOffer).filter(MarketMonetizationOffer.id == offer_id).first()

    def list_offers(
        self,
        target_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketMonetizationOffer]:
        query = self.db.query(MarketMonetizationOffer)
        if target_type:
            query = query.filter(MarketMonetizationOffer.target_type == target_type)
        if status:
            query = query.filter(MarketMonetizationOffer.status == status)
        return query.order_by(MarketMonetizationOffer.created_at.desc()).offset(offset).limit(limit).all()

    # Orders
    def get_order_by_idempotency_key(self, key: str) -> MarketMonetizationOrder | None:
        return self.db.query(MarketMonetizationOrder).filter(MarketMonetizationOrder.idempotency_key == key).first()

    def create_order(self, data: OrderCreate) -> MarketMonetizationOrder:
        contribution = round(data.amount - data.variable_cost, 2)
        order = MarketMonetizationOrder(
            offer_id=data.offer_id,
            customer_type=data.customer_type,
            customer_id=data.customer_id,
            amount=data.amount,
            currency=data.currency,
            status="INITIATED",
            idempotency_key=data.idempotency_key,
            variable_cost=data.variable_cost,
            contribution_margin=contribution,
            metadata_json=data.metadata,
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_order(self, order_id: str) -> MarketMonetizationOrder | None:
        return self.db.query(MarketMonetizationOrder).filter(MarketMonetizationOrder.id == order_id).first()

    def list_orders(
        self,
        customer_id: str | None = None,
        customer_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketMonetizationOrder]:
        query = self.db.query(MarketMonetizationOrder)
        if customer_id:
            query = query.filter(MarketMonetizationOrder.customer_id == customer_id)
        if customer_type:
            query = query.filter(MarketMonetizationOrder.customer_type == customer_type)
        if status:
            query = query.filter(MarketMonetizationOrder.status == status)
        return query.order_by(MarketMonetizationOrder.created_at.desc()).offset(offset).limit(limit).all()

    def update_order_status(
        self,
        order: MarketMonetizationOrder,
        new_status: str,
        refund_amount: float = 0.0,
        refund_reason: str | None = None,
    ) -> MarketMonetizationOrder:
        order.status = new_status
        if refund_amount > 0:
            order.refund_amount = refund_amount
            order.contribution_margin = round(order.amount - order.variable_cost - refund_amount, 2)
        if refund_reason:
            order.refund_reason = refund_reason
        self.db.commit()
        self.db.refresh(order)
        return order

    # Policies
    def create_policy(
        self,
        revenue_model: str,
        eligible_surface: str,
        ranking_influence: str = "NONE",
        disclosure_required: bool = True,
        user_impact: str | None = None,
        trust_risk: float = 0.0,
        approval_status: str = "APPROVED",
        approved_by: str | None = None,
    ) -> MarketMonetizationPolicy:
        policy = MarketMonetizationPolicy(
            revenue_model=revenue_model,
            eligible_surface=eligible_surface,
            ranking_influence=ranking_influence,
            disclosure_required=disclosure_required,
            user_impact=user_impact,
            trust_risk=trust_risk,
            approval_status=approval_status,
            approved_by=approved_by,
        )
        self.db.add(policy)
        self.db.commit()
        self.db.refresh(policy)
        return policy

    def list_policies(
        self,
        revenue_model: str | None = None,
        approval_status: str | None = None,
    ) -> list[MarketMonetizationPolicy]:
        query = self.db.query(MarketMonetizationPolicy)
        if revenue_model:
            query = query.filter(MarketMonetizationPolicy.revenue_model == revenue_model)
        if approval_status:
            query = query.filter(MarketMonetizationPolicy.approval_status == approval_status)
        return query.order_by(MarketMonetizationPolicy.created_at.asc()).all()
