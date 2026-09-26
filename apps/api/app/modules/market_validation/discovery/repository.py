from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.market_validation.discovery.models import MarketDiscoveryEvent


class DiscoveryEventRepository:
    def __init__(self, db: Session):
        self.db = db

    def record_event(self, event: MarketDiscoveryEvent) -> MarketDiscoveryEvent:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list(
        self,
        event_type: str | None = None,
        discovery_source: str | None = None,
        content_entry_id: str | None = None,
        destination_id: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MarketDiscoveryEvent]:
        query = self.db.query(MarketDiscoveryEvent)
        if event_type:
            query = query.filter(MarketDiscoveryEvent.event_type == event_type)
        if discovery_source:
            query = query.filter(MarketDiscoveryEvent.discovery_source == discovery_source)
        if content_entry_id:
            query = query.filter(MarketDiscoveryEvent.content_entry_id == content_entry_id)
        if destination_id:
            query = query.filter(MarketDiscoveryEvent.destination_id == destination_id)
        return query.order_by(MarketDiscoveryEvent.created_at.desc()).offset(offset).limit(limit).all()

    def count(
        self,
        event_type: str | None = None,
        discovery_source: str | None = None,
        content_entry_id: str | None = None,
        destination_id: str | None = None,
    ) -> int:
        query = self.db.query(MarketDiscoveryEvent)
        if event_type:
            query = query.filter(MarketDiscoveryEvent.event_type == event_type)
        if discovery_source:
            query = query.filter(MarketDiscoveryEvent.discovery_source == discovery_source)
        if content_entry_id:
            query = query.filter(MarketDiscoveryEvent.content_entry_id == content_entry_id)
        if destination_id:
            query = query.filter(MarketDiscoveryEvent.destination_id == destination_id)
        return query.count()
