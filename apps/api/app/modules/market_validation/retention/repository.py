from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.retention.models import MarketConsumerRetention


class ConsumerRetentionRepository:
    def get_by_id(self, db: Session, retention_id: str) -> MarketConsumerRetention | None:
        stmt = select(MarketConsumerRetention).where(MarketConsumerRetention.id == str(retention_id))
        return db.execute(stmt).scalars().first()

    def get_by_user_id(self, db: Session, user_id: str) -> MarketConsumerRetention | None:
        stmt = select(MarketConsumerRetention).where(MarketConsumerRetention.anonymous_user_id == user_id)
        return db.execute(stmt).scalars().first()

    def create(self, db: Session, item: MarketConsumerRetention) -> MarketConsumerRetention:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item: MarketConsumerRetention) -> MarketConsumerRetention:
        db.commit()
        db.refresh(item)
        return item

    def list(
        self,
        db: Session,
        retention_state: str | None = None,
        cohort_id: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketConsumerRetention]]:
        stmt = select(MarketConsumerRetention)
        count_stmt = select(func.count(MarketConsumerRetention.id))

        if retention_state:
            stmt = stmt.where(MarketConsumerRetention.retention_state == retention_state)
            count_stmt = count_stmt.where(MarketConsumerRetention.retention_state == retention_state)

        if cohort_id:
            stmt = stmt.where(MarketConsumerRetention.cohort_id == cohort_id)
            count_stmt = count_stmt.where(MarketConsumerRetention.cohort_id == cohort_id)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketConsumerRetention.updated_at.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)

    def count_by_state(self, db: Session) -> dict[str, int]:
        stmt = select(
            MarketConsumerRetention.retention_state,
            func.count(MarketConsumerRetention.id),
        ).group_by(MarketConsumerRetention.retention_state)
        results = db.execute(stmt).all()
        return {r[0]: r[1] for r in results}
