from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.participants.models import MarketParticipant
from app.modules.market_validation.interviews.models import MarketInterview
from app.modules.market_validation.problems.models import ConsumerProblem
from app.modules.market_validation.evidence.models import ValidationEvidence
from app.modules.market_validation.evidence.schemas import EvidenceCreate
from app.modules.market_validation.evidence.repository import EvidenceRepository


class EvidenceService:
    def __init__(self, repo: EvidenceRepository | None = None):
        self.repo = repo or EvidenceRepository()

    def create_evidence(self, db: Session, payload: EvidenceCreate) -> ValidationEvidence:
        participant = db.get(MarketParticipant, payload.participant_id)
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant {payload.participant_id} not found.",
            )

        interview = db.get(MarketInterview, payload.interview_id)
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview {payload.interview_id} not found.",
            )

        jtbd_id = payload.jtbd_id
        if payload.problem_id:
            problem = db.get(ConsumerProblem, payload.problem_id)
            if not problem:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Problem {payload.problem_id} not found.",
                )
            if not jtbd_id and problem.related_jtbd:
                jtbd_id = problem.related_jtbd

        evidence = ValidationEvidence(
            id=uuid.uuid4(),
            participant_id=payload.participant_id,
            interview_id=payload.interview_id,
            problem_id=payload.problem_id,
            jtbd_id=jtbd_id,
            evidence_type=payload.evidence_type,
            observation=payload.observation,
            source=payload.source,
            timestamp=payload.timestamp or datetime.now(timezone.utc),
            researcher_confidence=payload.researcher_confidence,
        )
        return self.repo.create(db, evidence)

    def get_evidence(self, db: Session, evidence_id: uuid.UUID) -> ValidationEvidence:
        evidence = self.repo.get_by_id(db, evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence {evidence_id} not found.",
            )
        return evidence

    def list_evidence(
        self,
        db: Session,
        problem_id: uuid.UUID | None = None,
        interview_id: uuid.UUID | None = None,
        participant_id: uuid.UUID | None = None,
        jtbd_id: str | None = None,
        evidence_type: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[ValidationEvidence]]:
        return self.repo.list(
            db,
            problem_id=problem_id,
            interview_id=interview_id,
            participant_id=participant_id,
            jtbd_id=jtbd_id,
            evidence_type=evidence_type,
            limit=limit,
            offset=offset,
        )
