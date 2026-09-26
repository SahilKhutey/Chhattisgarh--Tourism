from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.market_validation.content.models import MarketContentEntry
from app.modules.market_validation.content.repository import ContentRepository
from app.modules.market_validation.content.schemas import (
    ContentEntryCreate,
    ContentEntryUpdate,
    QualityBreakdown,
)


class ContentService:
    def __init__(self, db: Session):
        self.repo = ContentRepository(db)

    @staticmethod
    def calculate_quality(entry_data: dict) -> tuple[float, QualityBreakdown]:
        fields = entry_data.get("fields_json") or {}

        # 1. Completeness (up to 20)
        c_score = 0.0
        if entry_data.get("title"):
            c_score += 5.0
        if entry_data.get("category"):
            c_score += 5.0
        if entry_data.get("short_description"):
            c_score += 5.0
        if entry_data.get("long_description"):
            c_score += 5.0

        # 2. Geographic Context (up to 20)
        g_score = 0.0
        geo = fields.get("geography") or {}
        if geo.get("district") or entry_data.get("destination_id"):
            g_score += 5.0
        if geo.get("latitude") is not None and geo.get("longitude") is not None:
            g_score += 5.0
        if geo.get("nearby_places"):
            g_score += 5.0
        if geo.get("routes") or geo.get("corridors"):
            g_score += 5.0

        # 3. Practical Utility (up to 20)
        p_score = 0.0
        prac = fields.get("practical") or {}
        if prac.get("opening_hours"):
            p_score += 4.0
        if prac.get("fees") is not None or prac.get("pricing"):
            p_score += 4.0
        if prac.get("best_time") or prac.get("seasons"):
            p_score += 4.0
        if prac.get("recommended_duration") or prac.get("duration"):
            p_score += 4.0
        if prac.get("accessibility") or prac.get("parking"):
            p_score += 4.0

        # 4. Cultural Context (up to 15)
        cult_score = 0.0
        cult = fields.get("cultural") or {}
        if cult.get("history"):
            cult_score += 5.0
        if cult.get("local_story") or cult.get("significance"):
            cult_score += 5.0
        if cult.get("community_context") or cult.get("traditions"):
            cult_score += 5.0

        # 5. Trust & Provenance (up to 15)
        t_score = 0.0
        trust_meta = fields.get("trust") or {}
        gov_status = entry_data.get("governance_status", "CONTENT_DRAFT")
        if gov_status == "CONTENT_VERIFIED" or gov_status == "CONTENT_PUBLISHED":
            t_score += 7.0
        if entry_data.get("last_verified_at"):
            t_score += 4.0
        if trust_meta.get("official_reference") or trust_meta.get("source"):
            t_score += 4.0

        # 6. Localization (up to 10)
        l_score = 0.0
        loc = fields.get("localization") or {}
        if entry_data.get("language") in {"en", "hi", "hne"}:
            l_score += 5.0
        if loc.get("hi") or loc.get("hne"):
            l_score += 5.0

        total = round(c_score + g_score + p_score + cult_score + t_score + l_score, 1)

        breakdown = QualityBreakdown(
            completeness=c_score,
            accuracy=t_score,  # accuracy reflected via verification
            freshness=t_score if entry_data.get("last_verified_at") else 0.0,
            geographic_context=g_score,
            practical_utility=p_score,
            trust=t_score,
            localization=l_score,
            total=total,
        )
        return total, breakdown

    def create_content_entry(self, data: ContentEntryCreate) -> MarketContentEntry:
        existing = self.repo.get_by_content_id(data.content_id)
        if existing:
            raise HTTPException(status_code=409, detail=f"Content entry '{data.content_id}' already exists.")

        entry_dict = data.model_dump()
        score, breakdown = self.calculate_quality(entry_dict)

        entry = MarketContentEntry(
            content_id=data.content_id,
            content_type=data.content_type,
            title=data.title,
            category=data.category,
            destination_id=data.destination_id,
            short_description=data.short_description,
            long_description=data.long_description,
            language=data.language,
            fields_json=data.fields_json or {},
            quality_score=score,
            quality_breakdown=breakdown.model_dump(),
            governance_status=data.governance_status,
            last_verified_at=data.last_verified_at,
            next_review_at=data.next_review_at,
        )
        return self.repo.create(entry)

    def get_content_entry(self, entry_id: UUID) -> MarketContentEntry:
        entry = self.repo.get_by_id(entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Content entry not found.")
        return entry

    def get_by_content_id(self, content_id: str) -> MarketContentEntry:
        entry = self.repo.get_by_content_id(content_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Content entry not found.")
        return entry

    def update_content_entry(self, entry_id: UUID, data: ContentEntryUpdate) -> MarketContentEntry:
        entry = self.get_content_entry(entry_id)
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(entry, key, value)

        # Recalculate quality
        entry_dict = {
            "title": entry.title,
            "category": entry.category,
            "short_description": entry.short_description,
            "long_description": entry.long_description,
            "destination_id": entry.destination_id,
            "language": entry.language,
            "fields_json": entry.fields_json,
            "governance_status": entry.governance_status,
            "last_verified_at": entry.last_verified_at,
        }
        score, breakdown = self.calculate_quality(entry_dict)
        entry.quality_score = score
        entry.quality_breakdown = breakdown.model_dump()

        # Check freshness
        if entry.next_review_at:
            review_at = entry.next_review_at
            if review_at.tzinfo is None:
                review_at = review_at.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > review_at:
                if entry.governance_status == "CONTENT_VERIFIED":
                    entry.governance_status = "CONTENT_STALE"

        return self.repo.update(entry)

    def list_content_entries(
        self,
        content_type: str | None = None,
        category: str | None = None,
        governance_status: str | None = None,
        language: str | None = None,
        destination_id: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[int, list[MarketContentEntry]]:
        total = self.repo.count(
            content_type=content_type,
            category=category,
            governance_status=governance_status,
            language=language,
            destination_id=destination_id,
        )
        items = self.repo.list(
            content_type=content_type,
            category=category,
            governance_status=governance_status,
            language=language,
            destination_id=destination_id,
            limit=limit,
            offset=offset,
        )
        return total, items
