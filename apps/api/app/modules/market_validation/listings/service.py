from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.listings.models import MarketProviderListingExperiment
from app.modules.market_validation.providers.models import MarketProvider
from app.modules.market_validation.listings.schemas import (
    ListingCreate,
    ListingUpdate,
)
from app.modules.market_validation.listings.repository import ListingRepository


class ListingService:
    def __init__(self, repo: ListingRepository | None = None):
        self.repo = repo or ListingRepository()

    @staticmethod
    def calculate_quality_score(
        info: int, media: int, loc: int, srv: int, contact: int, trust: int
    ) -> int:
        return int(round((info + media + loc + srv + contact + trust) / 6.0))

    def create_listing(self, db: Session, payload: ListingCreate) -> MarketProviderListingExperiment:
        provider = db.get(MarketProvider, payload.provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {payload.provider_id} not found.",
            )

        quality_score = self.calculate_quality_score(
            payload.information_score,
            payload.media_score,
            payload.location_score,
            payload.service_score,
            payload.contact_score,
            payload.trust_score,
        )

        listing = MarketProviderListingExperiment(
            id=uuid.uuid4(),
            provider_id=payload.provider_id,
            template_id=payload.template_id,
            status=payload.status,
            information_score=payload.information_score,
            media_score=payload.media_score,
            location_score=payload.location_score,
            service_score=payload.service_score,
            contact_score=payload.contact_score,
            trust_score=payload.trust_score,
            listing_quality_score=quality_score,
            published_at=datetime.now(timezone.utc) if payload.status == "PUBLISHED" else None,
        )
        return self.repo.create(db, listing)

    def get_listing(self, db: Session, listing_id: uuid.UUID) -> MarketProviderListingExperiment:
        listing = self.repo.get_by_id(db, listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Listing {listing_id} not found.",
            )
        return listing

    def list_listings(
        self,
        db: Session,
        provider_id: uuid.UUID | None = None,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketProviderListingExperiment]]:
        return self.repo.list(db, provider_id=provider_id, status=status, limit=limit, offset=offset)

    def update_listing(
        self,
        db: Session,
        listing_id: uuid.UUID,
        payload: ListingUpdate,
    ) -> MarketProviderListingExperiment:
        listing = self.get_listing(db, listing_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(listing, field, value)

        listing.listing_quality_score = self.calculate_quality_score(
            listing.information_score,
            listing.media_score,
            listing.location_score,
            listing.service_score,
            listing.contact_score,
            listing.trust_score,
        )

        return self.repo.update(db, listing)

    def publish_listing(self, db: Session, listing_id: uuid.UUID) -> MarketProviderListingExperiment:
        listing = self.get_listing(db, listing_id)

        if listing.location_score <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Listing cannot be published without location details.",
            )

        if listing.contact_score <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Listing cannot be published without contact details.",
            )

        listing.listing_quality_score = self.calculate_quality_score(
            listing.information_score,
            listing.media_score,
            listing.location_score,
            listing.service_score,
            listing.contact_score,
            listing.trust_score,
        )

        listing.status = "PUBLISHED"
        listing.published_at = datetime.now(timezone.utc)
        return self.repo.update(db, listing)
