from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.evidence.models import ValidationEvidence


class EvidenceRepository:
    def create(self, db: Session, evidence: ValidationEvidence) -> ValidationEvidence:
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    def get_by_id(self, db: Session, evidence_id: UUID) -> ValidationEvidence | None:
        return db.get(ValidationEvidence, evidence_id)

    def list(
        self,
        db: Session,
        problem_id: UUID | None = None,
        interview_id: UUID | None = None,
        participant_id: UUID | None = None,
        jtbd_id: str | None = None,
        evidence_type: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[ValidationEvidence]]:
        stmt = select(ValidationEvidence)
        if problem_id:
            stmt = stmt.where(ValidationEvidence.problem_id == problem_id)
        if interview_id:
            stmt = stmt.where(ValidationEvidence.interview_id == interview_id)
        if participant_id:
            stmt = stmt.where(ValidationEvidence.participant_id == participant_id)
        if jtbd_id:
            stmt = stmt.where(ValidationEvidence.jtbd_id == jtbd_id)
        if evidence_type:
            stmt = stmt.where(ValidationEvidence.evidence_type == evidence_type)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(ValidationEvidence.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)
