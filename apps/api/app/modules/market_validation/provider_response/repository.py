from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.provider_response.models import MarketProviderResponse


class ProviderResponseRepository:
    def create(self, db: Session, response: MarketProviderResponse) -> MarketProviderResponse:
        db.add(response)
        db.commit()
        db.refresh(response)
        return response

    def list_by_provider(
        self,
        db: Session,
        provider_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> list[MarketProviderResponse]:
        stmt = (
            select(MarketProviderResponse)
            .where(MarketProviderResponse.provider_id == provider_id)
            .order_by(desc(MarketProviderResponse.responded_at))
            .limit(limit)
            .offset(offset)
        )
        return list(db.execute(stmt).scalars().all())

    def list_by_lead(
        self,
        db: Session,
        lead_id: str,
    ) -> list[MarketProviderResponse]:
        stmt = (
            select(MarketProviderResponse)
            .where(MarketProviderResponse.lead_id == lead_id)
            .order_by(desc(MarketProviderResponse.responded_at))
        )
        return list(db.execute(stmt).scalars().all())

    def list_all(self, db: Session) -> list[MarketProviderResponse]:
        stmt = select(MarketProviderResponse).order_by(desc(MarketProviderResponse.responded_at))
        return list(db.execute(stmt).scalars().all())
