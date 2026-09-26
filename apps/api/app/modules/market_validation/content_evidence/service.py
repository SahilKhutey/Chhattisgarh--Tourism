from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.market_validation.content.models import MarketContentEntry
from app.modules.market_validation.content_evidence.models import MarketContentEvidence
from app.modules.market_validation.content_evidence.repository import ContentEvidenceRepository
from app.modules.market_validation.content_evidence.schemas import (
    ContentEvidenceCreate,
    ContentEvidenceUpdate,
)


class ContentEvidenceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ContentEvidenceRepository(db)

    def create_evidence(self, data: ContentEvidenceCreate) -> MarketContentEvidence:
        entry = self.db.query(MarketContentEntry).filter(MarketContentEntry.id == data.content_entry_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Referenced content entry not found.")

        # Check for field contradiction
        status_to_assign = data.status
        if data.field_name:
            existing_for_field = [
                e for e in self.repo.list_by_entry(data.content_entry_id)
                if e.field_name == data.field_name and e.status in {"VERIFIED", "UNVERIFIED"}
            ]
            for ev in existing_for_field:
                # If claim differs significantly from existing verified claim
                if ev.claim.strip().lower() != data.claim.strip().lower() and ev.status == "VERIFIED":
                    status_to_assign = "CONTRADICTED"
                    ev.status = "CONTRADICTED"
                    self.repo.update(ev)

        evidence = MarketContentEvidence(
            content_entry_id=data.content_entry_id,
            claim=data.claim,
            field_name=data.field_name,
            source_type=data.source_type,
            source_reference=data.source_reference,
            observed_at=data.observed_at or datetime.now(timezone.utc),
            verified_at=data.verified_at,
            verifier=data.verifier,
            confidence=data.confidence,
            status=status_to_assign,
        )
        return self.repo.create(evidence)

    def get_evidence(self, item_id: UUID) -> MarketContentEvidence:
        item = self.repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Content evidence item not found.")
        return item

    def update_evidence(self, item_id: UUID, data: ContentEvidenceUpdate) -> MarketContentEvidence:
        item = self.get_evidence(item_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        return self.repo.update(item)

    def verify_evidence(self, item_id: UUID, verifier: str) -> MarketContentEvidence:
        item = self.get_evidence(item_id)
        item.status = "VERIFIED"
        item.verifier = verifier
        item.verified_at = datetime.now(timezone.utc)
        return self.repo.update(item)

    def list_evidence(
        self,
        content_entry_id: UUID | None = None,
        source_type: str | None = None,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[int, list[MarketContentEvidence]]:
        total = self.repo.count(content_entry_id=content_entry_id, source_type=source_type, status=status)
        items = self.repo.list(content_entry_id=content_entry_id, source_type=source_type, status=status, limit=limit, offset=offset)
        return total, items
