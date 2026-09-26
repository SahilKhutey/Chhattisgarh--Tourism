from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.market_validation.content_evidence.models import MarketContentEvidence


class ContentEvidenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, item: MarketContentEvidence) -> MarketContentEvidence:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_by_id(self, item_id: UUID) -> MarketContentEvidence | None:
        return self.db.query(MarketContentEvidence).filter(MarketContentEvidence.id == item_id).first()

    def list_by_entry(self, entry_id: UUID) -> list[MarketContentEvidence]:
        return (
            self.db.query(MarketContentEvidence)
            .filter(MarketContentEvidence.content_entry_id == entry_id)
            .order_by(MarketContentEvidence.created_at.desc())
            .all()
        )

    def list(
        self,
        content_entry_id: UUID | None = None,
        source_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketContentEvidence]:
        query = self.db.query(MarketContentEvidence)
        if content_entry_id:
            query = query.filter(MarketContentEvidence.content_entry_id == content_entry_id)
        if source_type:
            query = query.filter(MarketContentEvidence.source_type == source_type)
        if status:
            query = query.filter(MarketContentEvidence.status == status)
        return query.order_by(MarketContentEvidence.created_at.desc()).offset(offset).limit(limit).all()

    def count(
        self,
        content_entry_id: UUID | None = None,
        source_type: str | None = None,
        status: str | None = None,
    ) -> int:
        query = self.db.query(MarketContentEvidence)
        if content_entry_id:
            query = query.filter(MarketContentEvidence.content_entry_id == content_entry_id)
        if source_type:
            query = query.filter(MarketContentEvidence.source_type == source_type)
        if status:
            query = query.filter(MarketContentEvidence.status == status)
        return query.count()

    def update(self, item: MarketContentEvidence) -> MarketContentEvidence:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: MarketContentEvidence) -> None:
        self.db.delete(item)
        self.db.commit()
