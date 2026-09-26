from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.provider_retention.models import MarketProviderRetention


class ProviderRetentionRepository:
    def get_by_id(self, db: Session, retention_id: str) -> MarketProviderRetention | None:
        stmt = select(MarketProviderRetention).where(MarketProviderRetention.id == str(retention_id))
        return db.execute(stmt).scalars().first()

    def get_by_provider_id(self, db: Session, provider_id: str) -> MarketProviderRetention | None:
        stmt = select(MarketProviderRetention).where(MarketProviderRetention.provider_id == str(provider_id))
        return db.execute(stmt).scalars().first()

    def create(self, db: Session, item: MarketProviderRetention) -> MarketProviderRetention:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item: MarketProviderRetention) -> MarketProviderRetention:
        db.commit()
        db.refresh(item)
        return item

    def list(
        self,
        db: Session,
        region: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderRetention]]:
        stmt = select(MarketProviderRetention)
        count_stmt = select(func.count(MarketProviderRetention.id))

        if region:
            stmt = stmt.where(MarketProviderRetention.supply_density_region == region)
            count_stmt = count_stmt.where(MarketProviderRetention.supply_density_region == region)

        if status:
            stmt = stmt.where(MarketProviderRetention.continuation_status == status)
            count_stmt = count_stmt.where(MarketProviderRetention.continuation_status == status)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketProviderRetention.last_active_at.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)
