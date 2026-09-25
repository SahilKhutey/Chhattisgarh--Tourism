from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.analysis.models import ConsumerPlanningBaseline
from app.modules.market_validation.participants.models import MarketParticipant
from app.modules.market_validation.interviews.models import MarketInterview
from app.modules.market_validation.problems.models import ConsumerProblem
from app.modules.market_validation.jobs.models import JTBDValidation


class AnalysisRepository:
    def create_baseline(self, db: Session, baseline: ConsumerPlanningBaseline) -> ConsumerPlanningBaseline:
        db.add(baseline)
        db.commit()
        db.refresh(baseline)
        return baseline

    def list_baselines(self, db: Session) -> list[ConsumerPlanningBaseline]:
        stmt = select(ConsumerPlanningBaseline).order_by(desc(ConsumerPlanningBaseline.created_at))
        return list(db.execute(stmt).scalars().all())

    def get_counts(self, db: Session) -> tuple[int, int, int]:
        p_count = db.execute(select(func.count()).select_from(MarketParticipant)).scalar_one()
        i_count = db.execute(select(func.count()).select_from(MarketInterview)).scalar_one()
        prob_count = db.execute(select(func.count()).select_from(ConsumerProblem)).scalar_one()
        return p_count, i_count, prob_count

    def get_problems(self, db: Session) -> list[ConsumerProblem]:
        stmt = select(ConsumerProblem).order_by(desc(ConsumerProblem.pain_score))
        return list(db.execute(stmt).scalars().all())

    def get_jtbds(self, db: Session) -> list[JTBDValidation]:
        stmt = select(JTBDValidation).order_by(JTBDValidation.jtbd_key.asc())
        return list(db.execute(stmt).scalars().all())

    def get_participants(self, db: Session) -> list[MarketParticipant]:
        stmt = select(MarketParticipant)
        return list(db.execute(stmt).scalars().all())
