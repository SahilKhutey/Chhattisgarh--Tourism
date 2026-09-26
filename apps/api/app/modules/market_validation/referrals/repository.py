from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.referrals.models import MarketReferral


class ReferralRepository:
    def get_by_id(self, db: Session, referral_id: str) -> MarketReferral | None:
        stmt = select(MarketReferral).where(MarketReferral.id == str(referral_id))
        return db.execute(stmt).scalars().first()

    def get_by_code(self, db: Session, code: str) -> MarketReferral | None:
        stmt = select(MarketReferral).where(MarketReferral.referral_code == code)
        return db.execute(stmt).scalars().first()

    def create(self, db: Session, referral: MarketReferral) -> MarketReferral:
        db.add(referral)
        db.commit()
        db.refresh(referral)
        return referral

    def update(self, db: Session, referral: MarketReferral) -> MarketReferral:
        db.commit()
        db.refresh(referral)
        return referral

    def list(
        self,
        db: Session,
        referrer_id: str | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketReferral]]:
        stmt = select(MarketReferral)
        count_stmt = select(func.count(MarketReferral.id))

        if referrer_id:
            stmt = stmt.where(MarketReferral.referrer_id == referrer_id)
            count_stmt = count_stmt.where(MarketReferral.referrer_id == referrer_id)

        if status:
            stmt = stmt.where(MarketReferral.status == status)
            count_stmt = count_stmt.where(MarketReferral.status == status)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketReferral.created_at.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)
