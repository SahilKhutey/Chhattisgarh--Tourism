from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.participants.models import MarketParticipant


class ParticipantRepository:
    def create(self, db: Session, participant: MarketParticipant) -> MarketParticipant:
        db.add(participant)
        db.commit()
        db.refresh(participant)
        return participant

    def get_by_id(self, db: Session, participant_id: UUID) -> MarketParticipant | None:
        return db.get(MarketParticipant, participant_id)

    def get_by_anonymous_id(self, db: Session, anonymous_id: str) -> MarketParticipant | None:
        stmt = select(MarketParticipant).where(MarketParticipant.anonymous_id == anonymous_id)
        return db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        db: Session,
        segment: str | None = None,
        origin_region: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketParticipant]]:
        stmt = select(MarketParticipant)
        if segment:
            stmt = stmt.where(MarketParticipant.segment == segment)
        if origin_region:
            stmt = stmt.where(MarketParticipant.origin_region == origin_region)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(MarketParticipant.created_at.desc()).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, participant: MarketParticipant) -> MarketParticipant:
        db.commit()
        db.refresh(participant)
        return participant
