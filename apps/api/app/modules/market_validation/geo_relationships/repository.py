from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, or_

from app.modules.market_validation.geo_relationships.models import MarketGeoRelationship


class GeoRelationshipRepository:
    def create(self, db: Session, relationship: MarketGeoRelationship) -> MarketGeoRelationship:
        db.add(relationship)
        db.commit()
        db.refresh(relationship)
        return relationship

    def get_by_id(self, db: Session, id: UUID) -> MarketGeoRelationship | None:
        return db.get(MarketGeoRelationship, id)

    def find_existing(
        self,
        db: Session,
        source_id: str,
        target_id: str,
        relationship_type: str,
    ) -> MarketGeoRelationship | None:
        stmt = select(MarketGeoRelationship).where(
            MarketGeoRelationship.source_destination_id == source_id,
            MarketGeoRelationship.target_destination_id == target_id,
            MarketGeoRelationship.relationship_type == relationship_type,
        )
        return db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        db: Session,
        source_id: str | None = None,
        target_id: str | None = None,
        relationship_type: str | None = None,
        validation_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketGeoRelationship]]:
        stmt = select(MarketGeoRelationship)
        if source_id:
            stmt = stmt.where(MarketGeoRelationship.source_destination_id == source_id)
        if target_id:
            stmt = stmt.where(MarketGeoRelationship.target_destination_id == target_id)
        if relationship_type:
            stmt = stmt.where(MarketGeoRelationship.relationship_type == relationship_type)
        if validation_status:
            stmt = stmt.where(MarketGeoRelationship.validation_status == validation_status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketGeoRelationship.confidence)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def get_related(
        self,
        db: Session,
        destination_id: str,
        relationship_type: str | None = None,
    ) -> list[MarketGeoRelationship]:
        stmt = select(MarketGeoRelationship).where(
            or_(
                MarketGeoRelationship.source_destination_id == destination_id,
                MarketGeoRelationship.target_destination_id == destination_id,
            )
        )
        if relationship_type:
            stmt = stmt.where(MarketGeoRelationship.relationship_type == relationship_type)
        return list(db.execute(stmt).scalars().all())

    def update(self, db: Session, relationship: MarketGeoRelationship) -> MarketGeoRelationship:
        db.commit()
        db.refresh(relationship)
        return relationship
