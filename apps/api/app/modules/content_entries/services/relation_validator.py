from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_entries.domain.types import EntryValidationError
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template_version import TemplateVersion


class RelationValidator:
    def validate(
        self,
        db: Session,
        version: TemplateVersion,
        values: dict[str, Any] | None,
    ) -> None:
        values = values or {}
        errors: list[str] = []

        for field in version.fields:
            if field.type != "RELATION":
                continue

            raw_ids = values.get(field.key, [])
            if not raw_ids or not isinstance(raw_ids, list):
                continue

            target_template_slug = (field.config or {}).get("relation_template_slug")

            # Parse string IDs to UUIDs where applicable for SQL queries
            parsed_ids = []
            for item in raw_ids:
                try:
                    parsed_ids.append(uuid.UUID(str(item)))
                except (ValueError, TypeError):
                    errors.append(f"{field.key}: invalid relation ID '{item}'.")

            if not parsed_ids:
                continue

            entries = list(
                db.scalars(
                    select(ContentEntry).where(ContentEntry.id.in_(parsed_ids))
                )
            )

            found_ids = {str(e.id) for e in entries}

            for item in raw_ids:
                if str(item) not in found_ids:
                    errors.append(f"{field.key}: related entry {item} not found.")

            if target_template_slug:
                for entry in entries:
                    if entry.template and entry.template.slug != target_template_slug:
                        errors.append(
                            f"{field.key}: related entry {entry.id} belongs to template "
                            f"'{entry.template.slug}', expected '{target_template_slug}'."
                        )

        if errors:
            raise EntryValidationError(errors)
