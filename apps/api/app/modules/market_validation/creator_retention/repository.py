from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.creator_retention.models import MarketCreatorRetention


class CreatorRetentionRepository:
    def get_by_id(self, db: Session, retention_id: str) -> MarketCreatorRetention | None:
        stmt = select(MarketCreatorRetention).where(MarketCreatorRetention.id == str(retention_id))
        return db.execute(stmt).scalars().first()

    def get_by_creator_id(self, db: Session, creator_id: str) -> MarketCreatorRetention | None:
        stmt = select(MarketCreatorRetention).where(MarketCreatorRetention.creator_id == str(creator_id))
        return db.execute(stmt).scalars().first()

    def create(self, db: Session, item: MarketCreatorRetention) -> MarketCreatorRetention:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item: MarketCreatorRetention) -> MarketCreatorRetention:
        db.commit()
        db.refresh(item)
        return item

    def list(
        self,
        db: Session,
        retention_state: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketCreatorRetention]]:
        stmt = select(MarketCreatorRetention)
        count_stmt = select(func.count(MarketCreatorRetention.id))

        if retention_state:
            stmt = stmt.where(MarketCreatorRetention.retention_state == retention_state)
            count_stmt = count_stmt.where(MarketCreatorRetention.retention_state == retention_state)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketCreatorRetention.last_submission_at.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)
