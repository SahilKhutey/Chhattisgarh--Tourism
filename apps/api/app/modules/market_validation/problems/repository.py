from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.problems.models import ConsumerProblem


class ProblemRepository:
    def create(self, db: Session, problem: ConsumerProblem) -> ConsumerProblem:
        db.add(problem)
        db.commit()
        db.refresh(problem)
        return problem

    def get_by_id(self, db: Session, problem_id: UUID) -> ConsumerProblem | None:
        return db.get(ConsumerProblem, problem_id)

    def list(
        self,
        db: Session,
        journey_stage: str | None = None,
        cluster_tag: str | None = None,
        related_jtbd: str | None = None,
        min_pain_score: int | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[ConsumerProblem]]:
        stmt = select(ConsumerProblem)
        if journey_stage:
            stmt = stmt.where(ConsumerProblem.journey_stage == journey_stage)
        if cluster_tag:
            stmt = stmt.where(ConsumerProblem.cluster_tag == cluster_tag)
        if related_jtbd:
            stmt = stmt.where(ConsumerProblem.related_jtbd == related_jtbd)
        if min_pain_score is not None:
            stmt = stmt.where(ConsumerProblem.pain_score >= min_pain_score)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(ConsumerProblem.pain_score), desc(ConsumerProblem.created_at))
            .limit(limit)
            .offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, problem: ConsumerProblem) -> ConsumerProblem:
        db.commit()
        db.refresh(problem)
        return problem
