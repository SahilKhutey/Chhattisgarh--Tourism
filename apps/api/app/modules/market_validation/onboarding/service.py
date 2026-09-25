from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.onboarding.models import MarketProviderOnboarding
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.onboarding.schemas import (
    OnboardingStart,
    OnboardingStepUpdate,
    OnboardingComplete,
)
from app.modules.market_validation.onboarding.repository import OnboardingRepository


class OnboardingService:
    def __init__(self, repo: OnboardingRepository | None = None):
        self.repo = repo or OnboardingRepository()

    def start_onboarding(
        self,
        db: Session,
        provider_id: uuid.UUID,
        payload: OnboardingStart | None = None,
    ) -> MarketProviderOnboarding:
        provider = db.get(MarketProvider, provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider_id} not found.",
            )

        existing = self.repo.get_by_provider_id(db, provider_id)
        if existing:
            return existing

        questions = payload.questions_asked if payload else None
        onboarding = MarketProviderOnboarding(
            id=uuid.uuid4(),
            provider_id=provider.id,
            current_step=1,
            status="STARTED",
            started_at=datetime.now(timezone.utc),
            completion_rate=round(1.0 / 7.0, 2),
            required_fields_completed=False,
            questions_asked=questions,
        )
        return self.repo.create(db, onboarding)

    def get_by_provider_id(self, db: Session, provider_id: uuid.UUID) -> MarketProviderOnboarding:
        onboarding = self.repo.get_by_provider_id(db, provider_id)
        if not onboarding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Onboarding record for provider {provider_id} not found.",
            )
        return onboarding

    def update_step(
        self,
        db: Session,
        provider_id: uuid.UUID,
        payload: OnboardingStepUpdate,
    ) -> MarketProviderOnboarding:
        onboarding = self.get_by_provider_id(db, provider_id)
        
        onboarding.current_step = payload.step
        onboarding.completion_rate = round(payload.step / 7.0, 2)
        onboarding.status = "IN_PROGRESS" if payload.step < 7 else "COMPLETED"

        if payload.required_fields_completed is not None:
            onboarding.required_fields_completed = payload.required_fields_completed

        if payload.questions_asked is not None:
            onboarding.questions_asked = payload.questions_asked

        return self.repo.update(db, onboarding)

    def complete_onboarding(
        self,
        db: Session,
        provider_id: uuid.UUID,
        payload: OnboardingComplete,
    ) -> MarketProviderOnboarding:
        onboarding = self.get_by_provider_id(db, provider_id)

        # Requirement: Incomplete provider cannot be activated
        if not payload.required_fields_completed and not onboarding.required_fields_completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot complete onboarding: required fields are incomplete.",
            )

        now = datetime.now(timezone.utc)
        onboarding.status = "COMPLETED"
        onboarding.current_step = 7
        onboarding.completion_rate = 1.0
        onboarding.required_fields_completed = True
        onboarding.completed_at = now

        if onboarding.started_at:
            started = onboarding.started_at
            if started.tzinfo is None:
                started = started.replace(tzinfo=timezone.utc)
            delta = (now - started).total_seconds()
            onboarding.time_to_onboard_seconds = max(0, int(delta))

        # If activate_provider is True, update provider verification status
        if payload.activate_provider:
            provider = db.get(MarketProvider, provider_id)
            if provider:
                provider.verification_status = "VERIFIED"
                db.add(provider)

        return self.repo.update(db, onboarding)

    def list_onboardings(
        self,
        db: Session,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderOnboarding]]:
        return self.repo.list(db, status=status, limit=limit, offset=offset)
