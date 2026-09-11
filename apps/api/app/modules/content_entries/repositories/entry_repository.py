from __future__ import annotations

import uuid
from typing import Sequence
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.modules.content_entries.models.content_entry import ContentEntry


class ContentEntryRepository:
    def get(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
    ) -> ContentEntry | None:
        eid = uuid.UUID(str(entry_id)) if isinstance(entry_id, str) else entry_id
        return db.scalar(
            select(ContentEntry).where(ContentEntry.id == eid)
        )

    def get_for_update(
        self,
        db: Session,
        entry_id: uuid.UUID | str,
    ) -> ContentEntry | None:
        eid = uuid.UUID(str(entry_id)) if isinstance(entry_id, str) else entry_id
        stmt = select(ContentEntry).where(ContentEntry.id == eid)
        if db.bind and db.bind.dialect.name != "sqlite":
            stmt = stmt.with_for_update()
        return db.scalar(stmt)

    def get_by_template_and_slug(
        self,
        db: Session,
        template_id: uuid.UUID | str,
        slug: str,
    ) -> ContentEntry | None:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        return db.scalar(
            select(ContentEntry).where(
                ContentEntry.template_id == tid,
                ContentEntry.slug == slug,
            )
        )

    def list_for_template(
        self,
        db: Session,
        template_id: uuid.UUID | str,
    ) -> list[ContentEntry]:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        return list(
            db.scalars(
                select(ContentEntry)
                .where(ContentEntry.template_id == tid)
                .order_by(ContentEntry.updated_at.desc())
            )
        )

    def list_entries(
        self,
        db: Session,
        *,
        template_id: uuid.UUID | str | None = None,
        status: str | None = None,
        search: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> Sequence[ContentEntry]:
        stmt = select(ContentEntry)

        if template_id:
            tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
            stmt = stmt.where(ContentEntry.template_id == tid)

        if status:
            stmt = stmt.where(ContentEntry.status == status)

        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    ContentEntry.title.ilike(search_pattern),
                    ContentEntry.slug.ilike(search_pattern),
                )
            )

        stmt = stmt.order_by(ContentEntry.updated_at.desc()).offset(offset).limit(limit)
        return list(db.scalars(stmt))

    def count_entries(
        self,
        db: Session,
        *,
        template_id: uuid.UUID | str | None = None,
        status: str | None = None,
        search: str | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(ContentEntry)

        if template_id:
            tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
            stmt = stmt.where(ContentEntry.template_id == tid)

        if status:
            stmt = stmt.where(ContentEntry.status == status)

        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    ContentEntry.title.ilike(search_pattern),
                    ContentEntry.slug.ilike(search_pattern),
                )
            )

        return db.scalar(stmt) or 0

    def slug_exists(
        self,
        db: Session,
        template_id: uuid.UUID | str,
        slug: str,
        exclude_id: uuid.UUID | str | None = None,
    ) -> bool:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        stmt = select(ContentEntry.id).where(
            ContentEntry.template_id == tid,
            ContentEntry.slug == slug,
        )
        if exclude_id:
            eid = uuid.UUID(str(exclude_id)) if isinstance(exclude_id, str) else exclude_id
            stmt = stmt.where(ContentEntry.id != eid)
        return db.scalar(stmt) is not None

    def add(self, db: Session, entry: ContentEntry) -> ContentEntry:
        db.add(entry)
        db.flush()
        return entry
