from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.providers.models import MarketProvider, MarketProviderResearch


class ProviderRepository:
    def create(self, db: Session, provider: MarketProvider) -> MarketProvider:
        db.add(provider)
        db.commit()
        db.refresh(provider)
        return provider

    def get_by_id(self, db: Session, provider_id: UUID) -> MarketProvider | None:
        return db.get(MarketProvider, provider_id)

    def get_by_canonical_id(self, db: Session, canonical_id: UUID) -> MarketProvider | None:
        stmt = select(MarketProvider).where(MarketProvider.canonical_provider_id == canonical_id)
        return db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        db: Session,
        provider_type: str | None = None,
        segment: str | None = None,
        geography: str | None = None,
        verification_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProvider]]:
        stmt = select(MarketProvider)
        if provider_type:
            stmt = stmt.where(MarketProvider.provider_type == provider_type)
        if segment:
            stmt = stmt.where(MarketProvider.segment == segment)
        if geography:
            stmt = stmt.where(MarketProvider.geography == geography)
        if verification_status:
            stmt = stmt.where(MarketProvider.verification_status == verification_status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketProvider.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, provider: MarketProvider) -> MarketProvider:
        db.commit()
        db.refresh(provider)
        return provider

    def add_research(self, db: Session, research: MarketProviderResearch) -> MarketProviderResearch:
        db.add(research)
        db.commit()
        db.refresh(research)
        return research

    def get_research_by_provider(self, db: Session, provider_id: UUID) -> list[MarketProviderResearch]:
        stmt = (
            select(MarketProviderResearch)
            .where(MarketProviderResearch.provider_id == provider_id)
            .order_by(desc(MarketProviderResearch.created_at))
        )
        return list(db.execute(stmt).scalars().all())
