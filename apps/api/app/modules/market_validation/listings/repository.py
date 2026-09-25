from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.listings.models import MarketProviderListingExperiment


class ListingRepository:
    def create(self, db: Session, listing: MarketProviderListingExperiment) -> MarketProviderListingExperiment:
        db.add(listing)
        db.commit()
        db.refresh(listing)
        return listing

    def get_by_id(self, db: Session, listing_id: UUID) -> MarketProviderListingExperiment | None:
        return db.get(MarketProviderListingExperiment, listing_id)

    def list(
        self,
        db: Session,
        provider_id: UUID | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderListingExperiment]]:
        stmt = select(MarketProviderListingExperiment)
        if provider_id:
            stmt = stmt.where(MarketProviderListingExperiment.provider_id == provider_id)
        if status:
            stmt = stmt.where(MarketProviderListingExperiment.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketProviderListingExperiment.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, listing: MarketProviderListingExperiment) -> MarketProviderListingExperiment:
        db.commit()
        db.refresh(listing)
        return listing
