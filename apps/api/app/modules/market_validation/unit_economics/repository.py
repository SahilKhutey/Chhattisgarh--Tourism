from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.unit_economics.models import MarketUnitEconomics


class UnitEconomicsRepository:
    def __init__(self, db: Session):
        self.db = db

    def save(self, record: MarketUnitEconomics) -> MarketUnitEconomics:
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_by_id(self, record_id: str) -> MarketUnitEconomics | None:
        return self.db.query(MarketUnitEconomics).filter(MarketUnitEconomics.id == record_id).first()

    def list_records(self, segment: str | None = None) -> list[MarketUnitEconomics]:
        query = self.db.query(MarketUnitEconomics)
        if segment:
            query = query.filter(MarketUnitEconomics.segment == segment)
        return query.order_by(MarketUnitEconomics.created_at.desc()).all()
