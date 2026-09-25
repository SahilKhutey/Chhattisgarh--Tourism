from __future__ import annotations

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.problems.models import ConsumerProblem
from app.modules.market_validation.problems.schemas import (
    ProblemCreate,
    ProblemUpdate,
)
from app.modules.market_validation.problems.repository import ProblemRepository


class ProblemService:
    def __init__(self, repo: ProblemRepository | None = None):
        self.repo = repo or ProblemRepository()

    def calculate_pain_score(self, freq: int, sev: int, time_c: int, trust_i: int) -> int:
        return freq * sev * time_c * trust_i

    def create_problem(self, db: Session, payload: ProblemCreate) -> ConsumerProblem:
        pain_score = self.calculate_pain_score(
            payload.frequency,
            payload.severity,
            payload.time_cost,
            payload.trust_impact,
        )

        cluster = payload.cluster_tag
        if not cluster:
            # Assign canonical cluster fallback based on journey_stage
            stage_to_cluster = {
                "DISCOVERY": "DESTINATION_DISCOVERY",
                "EVALUATION": "INFORMATION_TRUST",
                "DECISION": "DECISION_UNCERTAINTY",
                "PLANNING": "GEOGRAPHIC_FEASIBILITY",
                "TRAVEL": "NAVIGATION_CONNECTIVITY",
                "EXPERIENCE": "LOCAL_AUTHENTICITY",
                "BOOKING": "TRANSACTION_FRICTION",
                "SHARING": "SOCIAL_DISTRIBUTION",
                "REVIEW": "COMMUNITY_FEEDBACK",
                "RETURN": "RETENTION_BARRIER",
            }
            cluster = stage_to_cluster.get(payload.journey_stage, "GENERAL_FRICTION")

        problem = ConsumerProblem(
            id=uuid.uuid4(),
            participant_id=payload.participant_id,
            interview_id=payload.interview_id,
            journey_stage=payload.journey_stage,
            problem_statement=payload.problem_statement,
            current_behavior=payload.current_behavior,
            workaround=payload.workaround,
            frequency=payload.frequency,
            severity=payload.severity,
            emotional_cost=payload.emotional_cost,
            financial_cost=payload.financial_cost,
            time_cost=payload.time_cost,
            trust_impact=payload.trust_impact,
            pain_score=pain_score,
            evidence_strength=payload.evidence_strength,
            affected_segment=payload.affected_segment,
            affected_geography=payload.affected_geography,
            related_jtbd=payload.related_jtbd,
            cluster_tag=cluster,
            status=payload.status,
        )
        return self.repo.create(db, problem)

    def get_problem(self, db: Session, problem_id: uuid.UUID) -> ConsumerProblem:
        problem = self.repo.get_by_id(db, problem_id)
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem {problem_id} not found.",
            )
        return problem

    def list_problems(
        self,
        db: Session,
        journey_stage: str | None = None,
        cluster_tag: str | None = None,
        related_jtbd: str | None = None,
        min_pain_score: int | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[ConsumerProblem]]:
        return self.repo.list(
            db,
            journey_stage=journey_stage,
            cluster_tag=cluster_tag,
            related_jtbd=related_jtbd,
            min_pain_score=min_pain_score,
            limit=limit,
            offset=offset,
        )

    def update_problem(
        self,
        db: Session,
        problem_id: uuid.UUID,
        payload: ProblemUpdate,
    ) -> ConsumerProblem:
        problem = self.get_problem(db, problem_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(problem, field, value)

        # Recalculate pain score if any dimension changed
        problem.pain_score = self.calculate_pain_score(
            problem.frequency,
            problem.severity,
            problem.time_cost,
            problem.trust_impact,
        )
        return self.repo.update(db, problem)
