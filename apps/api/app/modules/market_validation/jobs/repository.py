from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.jobs.models import JTBDValidation


class JTBDRepository:
    def create(self, db: Session, jtbd: JTBDValidation) -> JTBDValidation:
        db.add(jtbd)
        db.commit()
        db.refresh(jtbd)
        return jtbd

    def get_by_id(self, db: Session, jtbd_id: UUID) -> JTBDValidation | None:
        return db.get(JTBDValidation, jtbd_id)

    def get_by_key(self, db: Session, jtbd_key: str) -> JTBDValidation | None:
        stmt = select(JTBDValidation).where(JTBDValidation.jtbd_key == jtbd_key)
        return db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        db: Session,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[JTBDValidation]]:
        stmt = select(JTBDValidation)
        if status:
            stmt = stmt.where(JTBDValidation.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(JTBDValidation.jtbd_key.asc()).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update(self, db: Session, jtbd: JTBDValidation) -> JTBDValidation:
        db.commit()
        db.refresh(jtbd)
        return jtbd
