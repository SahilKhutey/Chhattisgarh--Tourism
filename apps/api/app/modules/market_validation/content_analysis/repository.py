from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.content_analysis.models import MarketContentPerformance


class ContentPerformanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_content_id(self, content_id: str) -> MarketContentPerformance | None:
        return (
            self.db.query(MarketContentPerformance)
            .filter(MarketContentPerformance.content_entry_id == content_id)
            .first()
        )

    def list(self, limit: int = 100, offset: int = 0) -> list[MarketContentPerformance]:
        return (
            self.db.query(MarketContentPerformance)
            .order_by(MarketContentPerformance.planning_activation_rate.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def count(self) -> int:
        return self.db.query(MarketContentPerformance).count()

    def update(self, item: MarketContentPerformance) -> MarketContentPerformance:
        self.db.commit()
        self.db.refresh(item)
        return item
