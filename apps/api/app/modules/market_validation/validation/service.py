from __future__ import annotations

import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.modules.market_validation.jobs.models import JTBDValidation
from app.modules.market_validation.evidence.models import ValidationEvidence
from app.modules.market_validation.validation.schemas import (
    ValidationActionRequest,
)


class ValidationService:
    def list_validations(
        self,
        db: Session,
        status_filter: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[JTBDValidation]]:
        stmt = select(JTBDValidation)
        if status_filter:
            stmt = stmt.where(JTBDValidation.status == status_filter)
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(JTBDValidation.jtbd_key.asc()).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def support_jtbd(
        self,
        db: Session,
        jtbd_id: uuid.UUID,
        payload: ValidationActionRequest,
    ) -> JTBDValidation:
        jtbd = db.get(JTBDValidation, jtbd_id)
        if not jtbd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"JTBD validation record {jtbd_id} not found.",
            )

        # Count evidence records linking to this JTBD
        ev_count = db.execute(
            select(func.count()).select_from(ValidationEvidence).where(
                ValidationEvidence.jtbd_id == jtbd.jtbd_key
            )
        ).scalar_one()

        req_supporting = payload.supporting_interviews_count or jtbd.supporting_interviews_count
        if ev_count == 0 and req_supporting == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Validation requires empirical evidence or supporting interviews. None found.",
            )

        if payload.supporting_interviews_count is not None:
            jtbd.supporting_interviews_count = payload.supporting_interviews_count
        if payload.direct_behavior_count is not None:
            jtbd.direct_behavior_count = payload.direct_behavior_count
        if payload.evidence_summary:
            jtbd.evidence_summary = payload.evidence_summary
        else:
            jtbd.evidence_summary = payload.rationale

        if jtbd.direct_behavior_count >= 3 or jtbd.supporting_interviews_count >= 10:
            jtbd.status = "STRONGLY_SUPPORTED"
        else:
            jtbd.status = "SUPPORTED"

        if jtbd.total_interviews_evaluated > 0:
            base_rate = jtbd.supporting_interviews_count / jtbd.total_interviews_evaluated
            behavior_boost = (
                jtbd.direct_behavior_count / max(1, (jtbd.direct_behavior_count + jtbd.observed_workaround_count))
            )
            jtbd.confidence_score = round(base_rate * (1.0 + behavior_boost), 2)
        else:
            jtbd.confidence_score = 1.0

        db.commit()
        db.refresh(jtbd)
        return jtbd

    def invalidate_jtbd(
        self,
        db: Session,
        jtbd_id: uuid.UUID,
        payload: ValidationActionRequest,
    ) -> JTBDValidation:
        jtbd = db.get(JTBDValidation, jtbd_id)
        if not jtbd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"JTBD validation record {jtbd_id} not found.",
            )

        jtbd.status = "INVALIDATED"
        jtbd.evidence_summary = f"Invalidated: {payload.rationale}"
        jtbd.confidence_score = 0.0
        db.commit()
        db.refresh(jtbd)
        return jtbd
