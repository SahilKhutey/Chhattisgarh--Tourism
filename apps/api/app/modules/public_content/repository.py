from __future__ import annotations

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry


class PublicContentRepository:
    """Authoritative repository for public content enforcing published boundaries."""

    def get_published_by_slug(
        self,
        db: Session,
        slug: str,
    ) -> ContentEntry | None:
        return db.scalar(
            select(ContentEntry).where(
                ContentEntry.slug == slug,
                ContentEntry.status == "PUBLISHED",
            )
        )

    def get_published_by_id(
        self,
        db: Session,
        entry_id: uuid.UUID,
    ) -> ContentEntry | None:
        return db.scalar(
            select(ContentEntry).where(
                ContentEntry.id == entry_id,
                ContentEntry.status == "PUBLISHED",
            )
        )

    def get_all_published_sitemap(
        self,
        db: Session,
    ) -> Sequence[tuple[str, str | None]]:
        stmt = (
            select(ContentEntry.slug, ContentEntry.updated_at)
            .where(ContentEntry.status == "PUBLISHED")
            .order_by(ContentEntry.updated_at.desc())
        )
        results = db.execute(stmt).all()
        return [
            (slug, updated_at.isoformat() if updated_at else None)
            for slug, updated_at in results
        ]

    def get_entry_for_preview(
        self,
        db: Session,
        entry_id: uuid.UUID,
    ) -> ContentEntry | None:
        return db.scalar(
            select(ContentEntry).where(
                ContentEntry.id == entry_id,
            )
        )
