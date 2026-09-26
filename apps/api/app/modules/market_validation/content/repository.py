from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.market_validation.content.models import MarketContentEntry


class ContentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, entry: MarketContentEntry) -> MarketContentEntry:
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_by_id(self, entry_id: UUID) -> MarketContentEntry | None:
        return self.db.query(MarketContentEntry).filter(MarketContentEntry.id == entry_id).first()

    def get_by_content_id(self, content_id: str) -> MarketContentEntry | None:
        return self.db.query(MarketContentEntry).filter(MarketContentEntry.content_id == content_id).first()

    def list(
        self,
        content_type: str | None = None,
        category: str | None = None,
        governance_status: str | None = None,
        language: str | None = None,
        destination_id: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketContentEntry]:
        query = self.db.query(MarketContentEntry)
        if content_type:
            query = query.filter(MarketContentEntry.content_type == content_type)
        if category:
            query = query.filter(MarketContentEntry.category == category)
        if governance_status:
            query = query.filter(MarketContentEntry.governance_status == governance_status)
        if language:
            query = query.filter(MarketContentEntry.language == language)
        if destination_id:
            query = query.filter(MarketContentEntry.destination_id == destination_id)
        return query.order_by(MarketContentEntry.created_at.desc()).offset(offset).limit(limit).all()

    def count(
        self,
        content_type: str | None = None,
        category: str | None = None,
        governance_status: str | None = None,
        language: str | None = None,
        destination_id: str | None = None,
    ) -> int:
        query = self.db.query(MarketContentEntry)
        if content_type:
            query = query.filter(MarketContentEntry.content_type == content_type)
        if category:
            query = query.filter(MarketContentEntry.category == category)
        if governance_status:
            query = query.filter(MarketContentEntry.governance_status == governance_status)
        if language:
            query = query.filter(MarketContentEntry.language == language)
        if destination_id:
            query = query.filter(MarketContentEntry.destination_id == destination_id)
        return query.count()

    def update(self, entry: MarketContentEntry) -> MarketContentEntry:
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete(self, entry: MarketContentEntry) -> None:
        self.db.delete(entry)
        self.db.commit()
