from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.market_validation.content.models import MarketContentEntry
from app.modules.market_validation.trust.models import MarketContentTrust
from app.modules.market_validation.trust.repository import ContentTrustRepository
from app.modules.market_validation.trust.schemas import (
    ContentTrustCreate,
    ContentTrustUpdate,
    TrustBreakdown,
)


class ContentTrustService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ContentTrustRepository(db)

    @staticmethod
    def compute_trust_score(
        verified_sources: int,
        source_count: int,
        freshness_score: float,
        provider_confirmation: bool,
        community_confirmation: bool,
        contradiction_count: int,
    ) -> tuple[float, TrustBreakdown]:
        # Official/Verified source bonus: +30 if at least 1 verified source
        official_bonus = 30.0 if verified_sources > 0 else 0.0

        # Recent verification bonus: up to +20 based on freshness_score (0-100 mapped to 0-20)
        recent_bonus = min(20.0, round((freshness_score / 100.0) * 20.0, 1))

        # Provider confirmation: +15
        provider_bonus = 15.0 if provider_confirmation else 0.0

        # Community confirmation: +15
        community_bonus = 15.0 if community_confirmation else 0.0

        # Fresh media bonus: +10 if freshness > 50
        fresh_media_bonus = 10.0 if freshness_score >= 50.0 else 0.0

        # Consistent sources bonus: +10 if >=2 sources and 0 contradictions
        consistent_bonus = 10.0 if source_count >= 2 and contradiction_count == 0 else 0.0

        # Contradiction penalty: -15 per contradiction
        penalty = float(contradiction_count * 15.0)

        raw_score = official_bonus + recent_bonus + provider_bonus + community_bonus + fresh_media_bonus + consistent_bonus - penalty
        clamped_score = max(0.0, min(100.0, raw_score))

        breakdown = TrustBreakdown(
            official_source_bonus=official_bonus,
            recent_verification_bonus=recent_bonus,
            provider_confirmation_bonus=provider_bonus,
            community_confirmation_bonus=community_bonus,
            fresh_media_bonus=fresh_media_bonus,
            consistent_sources_bonus=consistent_bonus,
            contradiction_penalty=penalty,
            total_trust_score=round(clamped_score, 1),
        )
        return round(clamped_score, 1), breakdown

    def get_or_compute_trust(self, content_entry_id: UUID) -> MarketContentTrust:
        entry = self.db.query(MarketContentEntry).filter(MarketContentEntry.id == content_entry_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Content entry not found.")

        existing = self.repo.get_by_entry(content_entry_id)
        if existing:
            return existing

        # Compute default trust based on evidence items
        evidence_items = entry.evidence_items or []
        verified_count = sum(1 for e in evidence_items if e.status == "VERIFIED")
        source_count = len(evidence_items)
        contra_count = sum(1 for e in evidence_items if e.status == "CONTRADICTED")
        provider_conf = any(e.source_type == "PROVIDER" and e.status == "VERIFIED" for e in evidence_items)
        comm_conf = any(e.source_type in {"LOCAL_COMMUNITY", "FIELD_OBSERVATION"} and e.status == "VERIFIED" for e in evidence_items)
        freshness = 80.0 if entry.last_verified_at else 40.0

        score, breakdown = self.compute_trust_score(
            verified_sources=verified_count,
            source_count=source_count,
            freshness_score=freshness,
            provider_confirmation=provider_conf,
            community_confirmation=comm_conf,
            contradiction_count=contra_count,
        )

        trust = MarketContentTrust(
            content_entry_id=content_entry_id,
            source_count=source_count,
            verified_sources=verified_count,
            freshness_score=freshness,
            contradiction_count=contra_count,
            provider_confirmation=provider_conf,
            community_confirmation=comm_conf,
            trust_score=score,
            trust_breakdown=breakdown.model_dump(),
            last_computed_at=datetime.now(timezone.utc),
        )
        return self.repo.create(trust)

    def update_trust(self, content_entry_id: UUID, data: ContentTrustUpdate) -> MarketContentTrust:
        trust = self.get_or_compute_trust(content_entry_id)
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(trust, key, value)

        score, breakdown = self.compute_trust_score(
            verified_sources=trust.verified_sources,
            source_count=trust.source_count,
            freshness_score=trust.freshness_score,
            provider_confirmation=trust.provider_confirmation,
            community_confirmation=trust.community_confirmation,
            contradiction_count=trust.contradiction_count,
        )
        trust.trust_score = score
        trust.trust_breakdown = breakdown.model_dump()
        trust.last_computed_at = datetime.now(timezone.utc)
        return self.repo.update(trust)
