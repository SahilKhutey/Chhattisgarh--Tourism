from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.interviews.models import MarketInterview


class InterviewRepository:
    def create(self, db: Session, interview: MarketInterview) -> MarketInterview:
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    def get_by_id(self, db: Session, interview_id: UUID) -> MarketInterview | None:
        return db.get(MarketInterview, interview_id)

    def list(
        self,
        db: Session,
        participant_id: UUID | None = None,
        transcript_status: str | None = None,
        destination: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketInterview]]:
        stmt = select(MarketInterview)
        if participant_id:
            stmt = stmt.where(MarketInterview.participant_id == participant_id)
        if transcript_status:
            stmt = stmt.where(MarketInterview.transcript_status == transcript_status)
        if destination:
            stmt = stmt.where(MarketInterview.destination == destination)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(MarketInterview.date.desc()).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, interview: MarketInterview) -> MarketInterview:
        db.commit()
        db.refresh(interview)
        return interview
