from __future__ import annotations

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.providers.models import MarketProvider, MarketProviderResearch
from app.modules.market_validation.providers.schemas import (
    ProviderCreate,
    ProviderUpdate,
    ProviderResearchCreate,
)
from app.modules.market_validation.providers.repository import ProviderRepository


class ProviderService:
    def __init__(self, repo: ProviderRepository | None = None):
        self.repo = repo or ProviderRepository()

    def create_provider(self, db: Session, payload: ProviderCreate) -> MarketProvider:
        if payload.canonical_provider_id:
            existing = self.repo.get_by_canonical_id(db, payload.canonical_provider_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Canonical provider ID {payload.canonical_provider_id} is already registered.",
                )

        provider = MarketProvider(
            id=uuid.uuid4(),
            canonical_provider_id=payload.canonical_provider_id,
            provider_type=payload.provider_type,
            segment=payload.segment,
            business_name=payload.business_name,
            geography=payload.geography,
            operating_area=payload.operating_area,
            verification_status=payload.verification_status,
            digital_presence=payload.digital_presence,
            acquisition_channels=payload.acquisition_channels,
            booking_method=payload.booking_method,
            response_method=payload.response_method,
            current_demand=payload.current_demand,
            desired_demand=payload.desired_demand,
            willingness_to_participate=payload.willingness_to_participate,
            willingness_to_pay=payload.willingness_to_pay,
            research_status=payload.research_status,
        )
        return self.repo.create(db, provider)

    def get_provider(self, db: Session, provider_id: uuid.UUID) -> MarketProvider:
        provider = self.repo.get_by_id(db, provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider_id} not found.",
            )
        return provider

    def list_providers(
        self,
        db: Session,
        provider_type: str | None = None,
        segment: str | None = None,
        geography: str | None = None,
        verification_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProvider]]:
        return self.repo.list(
            db,
            provider_type=provider_type,
            segment=segment,
            geography=geography,
            verification_status=verification_status,
            limit=limit,
            offset=offset,
        )

    def update_provider(
        self,
        db: Session,
        provider_id: uuid.UUID,
        payload: ProviderUpdate,
    ) -> MarketProvider:
        provider = self.get_provider(db, provider_id)
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(provider, field, value)
        return self.repo.update(db, provider)

    def record_research(
        self,
        db: Session,
        provider_id: uuid.UUID,
        payload: ProviderResearchCreate,
    ) -> MarketProviderResearch:
        provider = self.get_provider(db, provider_id)
        research = MarketProviderResearch(
            id=uuid.uuid4(),
            provider_id=provider.id,
            researcher_id=payload.researcher_id,
            interview_date=payload.interview_date,
            duration_minutes=payload.duration_minutes,
            acquisition_channels=payload.acquisition_channels,
            booking_channels=payload.booking_channels,
            operational_tools=payload.operational_tools,
            current_pain=payload.current_pain,
            desired_outcome=payload.desired_outcome,
            demand_problem=payload.demand_problem,
            digital_problem=payload.digital_problem,
            trust_problem=payload.trust_problem,
            booking_problem=payload.booking_problem,
            response_problem=payload.response_problem,
            summary=payload.summary,
        )
        return self.repo.add_research(db, research)

    def get_provider_research(
        self,
        db: Session,
        provider_id: uuid.UUID,
    ) -> list[MarketProviderResearch]:
        self.get_provider(db, provider_id)
        return self.repo.get_research_by_provider(db, provider_id)
