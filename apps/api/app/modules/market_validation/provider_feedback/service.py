from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.provider_feedback.models import MarketProviderFeedback
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.provider_feedback.schemas import (
    ProviderFeedbackCreate,
)
from app.modules.market_validation.provider_feedback.repository import ProviderFeedbackRepository


class ProviderFeedbackService:
    def __init__(self, repo: ProviderFeedbackRepository | None = None):
        self.repo = repo or ProviderFeedbackRepository()

    def record_feedback(self, db: Session, payload: ProviderFeedbackCreate) -> MarketProviderFeedback:
        provider = db.get(MarketProvider, payload.provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {payload.provider_id} not found.",
            )

        feedback = MarketProviderFeedback(
            id=uuid.uuid4(),
            provider_id=payload.provider_id,
            journey=payload.journey,
            feature=payload.feature,
            sentiment=payload.sentiment,
            problem=payload.problem,
            value=payload.value,
            difficulty=payload.difficulty,
            willingness_to_continue=payload.willingness_to_continue,
            willingness_to_pay=payload.willingness_to_pay,
            free_text=payload.free_text,
            created_at=datetime.now(timezone.utc),
        )
        return self.repo.create(db, feedback)

    def list_feedback(
        self,
        db: Session,
        provider_id: uuid.UUID | None = None,
        journey: str | None = None,
        sentiment: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderFeedback]]:
        return self.repo.list(
            db,
            provider_id=provider_id,
            journey=journey,
            sentiment=sentiment,
            limit=limit,
            offset=offset,
        )
