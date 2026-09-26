from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.modules.market_validation.monetization.models import (
    MarketMonetizationOffer,
    MarketMonetizationOrder,
    MarketMonetizationPolicy,
)
from app.modules.market_validation.monetization.repository import MonetizationRepository
from app.modules.market_validation.monetization.schemas import (
    OfferCreate,
    OrderCreate,
    OrderStatusUpdate,
    VALID_ORDER_STATUSES,
)

DEFAULT_POLICIES = [
    {
        "revenue_model": "FREE_DISCOVERY",
        "eligible_surface": "PUBLIC_SEARCH_AND_MAPS",
        "ranking_influence": "NONE",
        "disclosure_required": False,
        "user_impact": "Completely free open access to all geographic, safety, and cultural destination data.",
        "trust_risk": 0.0,
        "approval_status": "APPROVED",
        "approved_by": "SYSTEM_TRUST_POLICY",
    },
    {
        "revenue_model": "QUALIFIED_LEAD_FEE",
        "eligible_surface": "PROVIDER_DIRECT_INQUIRY",
        "ranking_influence": "NONE",
        "disclosure_required": True,
        "user_impact": "Direct, authenticated contact handoff. Organic destination ordering remains strictly quality-ranked.",
        "trust_risk": 0.05,
        "approval_status": "APPROVED",
        "approved_by": "SYSTEM_TRUST_POLICY",
    },
    {
        "revenue_model": "COMMISSION_ON_BOOKING",
        "eligible_surface": "EXPERIENCE_CHECKOUT",
        "ranking_influence": "NONE",
        "disclosure_required": True,
        "user_impact": "Transparent platform facilitation fee on successfully fulfilled tourism bookings.",
        "trust_risk": 0.05,
        "approval_status": "APPROVED",
        "approved_by": "SYSTEM_TRUST_POLICY",
    },
    {
        "revenue_model": "PROVIDER_SUBSCRIPTION",
        "eligible_surface": "PROVIDER_DASHBOARD_AND_TOOLS",
        "ranking_influence": "NONE",
        "disclosure_required": True,
        "user_impact": "Value-added operational tools: inquiry CRM, inventory sync, seasonal analytics. No search bias.",
        "trust_risk": 0.02,
        "approval_status": "APPROVED",
        "approved_by": "SYSTEM_TRUST_POLICY",
    },
    {
        "revenue_model": "SPONSORED_PROMOTION",
        "eligible_surface": "FEATURED_BANNER_CAROUSEL",
        "ranking_influence": "NONE",
        "disclosure_required": True,
        "user_impact": "Explicitly labeled 'SPONSORED' cards. Never alters organic algorithm or reviews.",
        "trust_risk": 0.15,
        "approval_status": "APPROVED",
        "approved_by": "SYSTEM_TRUST_POLICY",
    },
]

DEFAULT_OFFERS = [
    {
        "revenue_stream_id": None,
        "target_type": "PROVIDER",
        "offer_title": "Verified Lead Bundle (Starter)",
        "offer_description": "10 high-intent, phone-verified traveler inquiries for local homestays and guides.",
        "price": 250.0,
        "currency": "INR",
        "billing_cycle": "ONE_TIME",
        "features": ["10 verified traveler leads", "WhatsApp direct connect", "Lead qualification notes"],
        "status": "ACTIVE",
    },
    {
        "revenue_stream_id": None,
        "target_type": "PROVIDER",
        "offer_title": "Provider Pro Monthly Tier",
        "offer_description": "Full access to inquiry CRM, seasonal rate recommendations, and verified operator badge.",
        "price": 499.0,
        "currency": "INR",
        "billing_cycle": "MONTHLY",
        "features": ["Inquiry CRM", "Verified Operator Badge", "Demand Analytics", "Direct WhatsApp Integration"],
        "status": "ACTIVE",
    },
    {
        "revenue_stream_id": None,
        "target_type": "CONSUMER",
        "offer_title": "Bastar Artisan Cultural Pass",
        "offer_description": "Self-guided immersive artisan workshop itinerary with digital route guidance and offline maps.",
        "price": 149.0,
        "currency": "INR",
        "billing_cycle": "ONE_TIME",
        "features": ["Offline audio guide", "Direct artisan workshop booking", "Curated craft trail"],
        "status": "ACTIVE",
    },
]


class MonetizationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MonetizationRepository(db)

    def initialize_defaults(self) -> None:
        """Seed default trust policies and baseline offers if empty."""
        existing_policies = self.repo.list_policies()
        if not existing_policies:
            for pol in DEFAULT_POLICIES:
                self.repo.create_policy(**pol)

        existing_offers = self.repo.list_offers()
        if not existing_offers:
            for off in DEFAULT_OFFERS:
                self.repo.create_offer(OfferCreate(**off))

    def create_offer(self, data: OfferCreate) -> MarketMonetizationOffer:
        return self.repo.create_offer(data)

    def get_offer(self, offer_id: str) -> MarketMonetizationOffer:
        offer = self.repo.get_offer(offer_id)
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        return offer

    def list_offers(
        self,
        target_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketMonetizationOffer]:
        self.initialize_defaults()
        return self.repo.list_offers(target_type=target_type, status=status, limit=limit, offset=offset)

    def create_order(self, data: OrderCreate) -> MarketMonetizationOrder:
        # Idempotency check to safeguard flaky rural connectivity
        if data.idempotency_key:
            existing = self.repo.get_order_by_idempotency_key(data.idempotency_key)
            if existing:
                return existing

        offer = self.repo.get_offer(data.offer_id)
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found for order")
        if offer.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Offer is not currently active")

        return self.repo.create_order(data)

    def get_order(self, order_id: str) -> MarketMonetizationOrder:
        order = self.repo.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    def list_orders(
        self,
        customer_id: str | None = None,
        customer_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketMonetizationOrder]:
        return self.repo.list_orders(
            customer_id=customer_id,
            customer_type=customer_type,
            status=status,
            limit=limit,
            offset=offset,
        )

    def update_order_status(self, order_id: str, data: OrderStatusUpdate) -> MarketMonetizationOrder:
        if data.status not in VALID_ORDER_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{data.status}'. Allowed: {sorted(list(VALID_ORDER_STATUSES))}",
            )
        order = self.get_order(order_id)

        refund_amt = data.refund_amount or 0.0
        if refund_amt > order.amount:
            raise HTTPException(status_code=400, detail="Refund amount exceeds total order amount")

        return self.repo.update_order_status(
            order=order,
            new_status=data.status,
            refund_amount=refund_amt,
            refund_reason=data.refund_reason,
        )

    def list_policies(
        self,
        revenue_model: str | None = None,
        approval_status: str | None = None,
    ) -> list[MarketMonetizationPolicy]:
        self.initialize_defaults()
        return self.repo.list_policies(revenue_model=revenue_model, approval_status=approval_status)

    def validate_trust_guardrail(self, revenue_model: str, ranking_influence: str) -> bool:
        """
        Guardrail check: Monetization must NEVER corrupt organic ranking, search algorithms, or safety scores.
        """
        if ranking_influence.upper() not in ("NONE", "EXPLICIT_SPONSORED_SLOT"):
            return False
        return True
