from __future__ import annotations

import re
import unicodedata
import uuid
from datetime import datetime, timezone
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.domain.types import (
    ContentEntryStatus,
    EntryConflictError,
    EntryNotFoundError,
    EntryValidationError,
)
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_entries.repositories.entry_repository import (
    ContentEntryRepository,
)
from app.modules.content_entries.schemas.entries import (
    ContentEntryCreate,
    ContentEntryUpdate,
)
from app.modules.content_entries.services.entry_validator import (
    ContentEntryValidator,
)
from app.modules.content_entries.services.relation_validator import (
    RelationValidator,
)
from app.modules.content_template.models import ContentTemplate
from app.modules.content_template.models.template_version import TemplateVersion
from app.modules.content_template.services.audit_service import (
    TemplateAuditService,
)


class ContentEntryService:
    def __init__(
        self,
        repository: ContentEntryRepository | None = None,
        validator: ContentEntryValidator | None = None,
        relation_validator: RelationValidator | None = None,
        audit_service: TemplateAuditService | None = None,
    ) -> None:
        self.repository = repository or ContentEntryRepository()
        self.validator = validator or ContentEntryValidator()
        self.relation_validator = relation_validator or RelationValidator()
        self.audit_service = audit_service or TemplateAuditService()

    def create(
        self,
        db: Session,
        template: ContentTemplate,
        version: TemplateVersion,
        payload: ContentEntryCreate,
        user_id: str | uuid.UUID,
    ) -> ContentEntry:
        # Validate values against bound version
        self.validator.validate(
            version,
            payload.values,
            payload.locale_values,
        )

        # Validate relations if any
        self.relation_validator.validate(
            db,
            version,
            payload.values,
        )

        # Determine unique slug
        raw_slug = payload.slug or self.generate_slug(payload.title)
        slug = self.unique_slug(db, template.id, raw_slug)

        entry = ContentEntry(
            id=uuid.uuid4(),
            template_id=template.id,
            template_version_id=version.id,
            slug=slug,
            title=payload.title,
            status=ContentEntryStatus.DRAFT.value,
            values=payload.values or {},
            locale_values=payload.locale_values or {},
            revision=1,
            created_by=str(user_id),
            updated_by=str(user_id),
        )

        self.repository.add(db, entry)

        self.audit_service.record(
            db,
            event_type="CONTENT_ENTRY_CREATED",
            actor_id=str(user_id),
            entity_type="CONTENT_ENTRY",
            entity_id=str(entry.id),
            payload={
                "template_id": str(template.id),
                "template_version_id": str(version.id),
                "version_number": version.version_number,
                "slug": slug,
                "title": payload.title,
            },
        )

        return entry

    def update(
        self,
        db: Session,
        entry_id: str | uuid.UUID,
        payload: ContentEntryUpdate,
        user_id: str | uuid.UUID,
    ) -> ContentEntry:
        entry = self.repository.get_for_update(db, entry_id)
        if entry is None:
            raise EntryNotFoundError(f"Content entry {entry_id} not found.")

        # Optimistic concurrency check
        if payload.revision != entry.revision:
            raise EntryConflictError(
                message="Content entry has changed.",
                current_revision=entry.revision,
            )

        # Load bound version
        vid = entry.template_version_id
        version = db.scalar(
            select(TemplateVersion).where(TemplateVersion.id == vid)
        )
        if version is None:
            raise ValueError(f"Entry references missing template version {vid}.")

        values = payload.values if payload.values is not None else entry.values
        locale_values = (
            payload.locale_values
            if payload.locale_values is not None
            else entry.locale_values
        )

        # Validate against bound version
        self.validator.validate(
            version,
            values,
            locale_values,
        )

        if payload.title is not None:
            entry.title = payload.title

        if payload.slug is not None and payload.slug != entry.slug:
            slug = self.unique_slug(db, entry.template_id, payload.slug, exclude_id=entry.id)
            entry.slug = slug

        entry.values = values
        entry.locale_values = locale_values
        entry.updated_by = str(user_id)
        entry.revision += 1

        db.flush()

        self.audit_service.record(
            db,
            event_type="CONTENT_ENTRY_UPDATED",
            actor_id=str(user_id),
            entity_type="CONTENT_ENTRY",
            entity_id=str(entry.id),
            payload={
                "revision": entry.revision,
                "slug": entry.slug,
                "title": entry.title,
            },
        )

        return entry

    def publish(
        self,
        db: Session,
        entry_id: str | uuid.UUID,
        user_id: str | uuid.UUID,
    ) -> ContentEntry:
        entry = self.repository.get_for_update(db, entry_id)
        if entry is None:
            raise EntryNotFoundError(f"Content entry {entry_id} not found.")

        vid = entry.template_version_id
        version = db.scalar(
            select(TemplateVersion).where(TemplateVersion.id == vid)
        )
        if version is None:
            raise ValueError(f"Template version {vid} not found.")

        # Validate values, locales, relations, and accessibility
        self.validator.validate(
            version,
            entry.values,
            entry.locale_values,
        )

        self.relation_validator.validate(
            db,
            version,
            entry.values,
        )

        entry.status = ContentEntryStatus.PUBLISHED.value
        entry.published_at = datetime.now(timezone.utc)
        entry.updated_by = str(user_id)

        db.flush()

        self.audit_service.record(
            db,
            event_type="CONTENT_ENTRY_PUBLISHED",
            actor_id=str(user_id),
            entity_type="CONTENT_ENTRY",
            entity_id=str(entry.id),
            payload={
                "template_version_id": str(version.id),
                "version_number": version.version_number,
                "published_at": entry.published_at.isoformat(),
            },
        )

        return entry

    def archive(
        self,
        db: Session,
        entry_id: str | uuid.UUID,
        user_id: str | uuid.UUID,
    ) -> ContentEntry:
        entry = self.repository.get_for_update(db, entry_id)
        if entry is None:
            raise EntryNotFoundError(f"Content entry {entry_id} not found.")

        entry.status = ContentEntryStatus.ARCHIVED.value
        entry.updated_by = str(user_id)

        db.flush()

        self.audit_service.record(
            db,
            event_type="CONTENT_ENTRY_ARCHIVED",
            actor_id=str(user_id),
            entity_type="CONTENT_ENTRY",
            entity_id=str(entry.id),
            payload={
                "status": entry.status,
            },
        )

        return entry

    @staticmethod
    def generate_slug(title: str) -> str:
        normalized = (
            unicodedata.normalize("NFKD", title)
            .encode("ascii", "ignore")
            .decode()
        )
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized)
        slug = slug.strip("-").lower()
        return slug[:220] or "entry"

    def unique_slug(
        self,
        db: Session,
        template_id: str | uuid.UUID,
        requested_slug: str,
        exclude_id: str | uuid.UUID | None = None,
    ) -> str:
        base = self.generate_slug(requested_slug)
        slug = base
        counter = 2

        while self.repository.slug_exists(db, template_id, slug, exclude_id=exclude_id):
            slug = f"{base}-{counter}"
            counter += 1

        return slug
