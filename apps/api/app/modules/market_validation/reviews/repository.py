from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.modules.market_validation.reviews.models import MarketReviewValidation


class ReviewValidationRepository:
    def get_by_id(self, db: Session, review_id: str) -> MarketReviewValidation | None:
        stmt = select(MarketReviewValidation).where(
            (MarketReviewValidation.id == str(review_id)) | (MarketReviewValidation.review_id == str(review_id))
        )
        return db.execute(stmt).scalars().first()

    def create(self, db: Session, item: MarketReviewValidation) -> MarketReviewValidation:
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update(self, db: Session, item: MarketReviewValidation) -> MarketReviewValidation:
        db.commit()
        db.refresh(item)
        return item

    def list(
        self,
        db: Session,
        provider_id: str | None = None,
        experience_id: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketReviewValidation]]:
        stmt = select(MarketReviewValidation)
        count_stmt = select(func.count(MarketReviewValidation.id))

        if provider_id:
            stmt = stmt.where(MarketReviewValidation.provider_id == provider_id)
            count_stmt = count_stmt.where(MarketReviewValidation.provider_id == provider_id)

        if experience_id:
            stmt = stmt.where(MarketReviewValidation.experience_id == experience_id)
            count_stmt = count_stmt.where(MarketReviewValidation.experience_id == experience_id)

        total = db.execute(count_stmt).scalar() or 0
        items = db.execute(
            stmt.order_by(MarketReviewValidation.submitted_at.desc()).limit(limit).offset(offset)
        ).scalars().all()

        return total, list(items)
