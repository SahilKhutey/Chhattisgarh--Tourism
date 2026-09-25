from __future__ import annotations

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.jobs.models import JTBDValidation
from app.modules.market_validation.jobs.schemas import (
    JTBDCreate,
    JTBDUpdate,
)
from app.modules.market_validation.jobs.repository import JTBDRepository

DEFAULT_JTBDS = [
    {
        "jtbd_key": "JTBD-1",
        "title": "Discover",
        "description": "I want to discover interesting places in Chhattisgarh that match my interests.",
    },
    {
        "jtbd_key": "JTBD-2",
        "title": "Decide",
        "description": "I want enough trustworthy information to decide whether a place is worth visiting.",
    },
    {
        "jtbd_key": "JTBD-3",
        "title": "Plan",
        "description": "I want to turn several places into a realistic trip.",
    },
    {
        "jtbd_key": "JTBD-4",
        "title": "Navigate",
        "description": "I want to understand how to get there and what is nearby.",
    },
    {
        "jtbd_key": "JTBD-5",
        "title": "Experience",
        "description": "I want useful information while I'm actually travelling.",
    },
    {
        "jtbd_key": "JTBD-6",
        "title": "Local Participation",
        "description": "I want to find authentic local experiences, creators, guides and businesses.",
    },
]


class JTBDService:
    def __init__(self, repo: JTBDRepository | None = None):
        self.repo = repo or JTBDRepository()

    def ensure_default_jtbds(self, db: Session) -> list[JTBDValidation]:
        results = []
        for def_item in DEFAULT_JTBDS:
            existing = self.repo.get_by_key(db, def_item["jtbd_key"])
            if not existing:
                item = JTBDValidation(
                    id=uuid.uuid4(),
                    jtbd_key=def_item["jtbd_key"],
                    title=def_item["title"],
                    description=def_item["description"],
                    status="UNTESTED",
                )
                self.repo.create(db, item)
                results.append(item)
            else:
                results.append(existing)
        return results

    def create_jtbd(self, db: Session, payload: JTBDCreate) -> JTBDValidation:
        existing = self.repo.get_by_key(db, payload.jtbd_key)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"JTBD key {payload.jtbd_key} already exists.",
            )
        jtbd = JTBDValidation(
            id=uuid.uuid4(),
            jtbd_key=payload.jtbd_key,
            title=payload.title,
            description=payload.description,
            status=payload.status,
            total_interviews_evaluated=payload.total_interviews_evaluated,
            supporting_interviews_count=payload.supporting_interviews_count,
            direct_behavior_count=payload.direct_behavior_count,
            observed_workaround_count=payload.observed_workaround_count,
            confidence_score=payload.confidence_score,
            evidence_summary=payload.evidence_summary,
        )
        return self.repo.create(db, jtbd)

    def get_jtbd(self, db: Session, jtbd_id: uuid.UUID) -> JTBDValidation:
        jtbd = self.repo.get_by_id(db, jtbd_id)
        if not jtbd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"JTBD {jtbd_id} not found.",
            )
        return jtbd

    def get_by_key(self, db: Session, jtbd_key: str) -> JTBDValidation:
        jtbd = self.repo.get_by_key(db, jtbd_key)
        if not jtbd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"JTBD with key {jtbd_key} not found.",
            )
        return jtbd

    def list_jtbds(
        self,
        db: Session,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[JTBDValidation]]:
        total, items = self.repo.list(db, status=status, limit=limit, offset=offset)
        if total == 0:
            # Seed defaults on first query
            self.ensure_default_jtbds(db)
            total, items = self.repo.list(db, status=status, limit=limit, offset=offset)
        return total, items

    def update_jtbd(
        self,
        db: Session,
        jtbd_id: uuid.UUID,
        payload: JTBDUpdate,
    ) -> JTBDValidation:
        jtbd = self.get_jtbd(db, jtbd_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(jtbd, field, value)

        if jtbd.total_interviews_evaluated > 0:
            base_rate = jtbd.supporting_interviews_count / jtbd.total_interviews_evaluated
            behavior_boost = (
                jtbd.direct_behavior_count / max(1, (jtbd.direct_behavior_count + jtbd.observed_workaround_count))
            )
            jtbd.confidence_score = round(base_rate * (1.0 + behavior_boost), 2)

        return self.repo.update(db, jtbd)
