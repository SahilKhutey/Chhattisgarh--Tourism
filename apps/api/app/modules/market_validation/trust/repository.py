from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.market_validation.trust.models import MarketContentTrust


class ContentTrustRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, item: MarketContentTrust) -> MarketContentTrust:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_by_id(self, item_id: UUID) -> MarketContentTrust | None:
        return self.db.query(MarketContentTrust).filter(MarketContentTrust.id == item_id).first()

    def get_by_entry(self, entry_id: UUID) -> MarketContentTrust | None:
        return self.db.query(MarketContentTrust).filter(MarketContentTrust.content_entry_id == entry_id).first()

    def update(self, item: MarketContentTrust) -> MarketContentTrust:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: MarketContentTrust) -> None:
        self.db.delete(item)
        self.db.commit()
