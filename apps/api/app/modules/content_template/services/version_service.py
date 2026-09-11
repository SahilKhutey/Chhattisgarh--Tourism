from __future__ import annotations

import hashlib
import json
import uuid
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.content_template.models.template_version import (
    TemplateVersion,
    TemplateVersionField,
)


class TemplateVersionService:

    def next_version_number(
        self,
        db: Session,
        template_id: uuid.UUID | str,
    ) -> int:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        current = db.scalar(
            select(func.max(TemplateVersion.version_number)).where(
                TemplateVersion.template_id == tid
            )
        )
        return (current or 0) + 1

    def compute_schema_hash(self, template) -> str:
        fields = sorted(
            template.fields,
            key=lambda field: field.order,
        )

        snapshot = [
            {
                "config": field.config or {},
                "group": getattr(field, "group", getattr(field, "group_name", None)),
                "helpText": field.help_text,
                "key": field.key,
                "label": field.label,
                "order": field.order,
                "required": field.required,
                "translatable": field.translatable,
                "type": getattr(field, "type", getattr(field, "field_type", None)),
            }
            for field in fields
        ]

        schema_payload = {
            "category": template.category,
            "description": template.description,
            "fields": snapshot,
            "icon": template.icon,
            "name": template.name,
            "slug": template.slug,
        }

        canonical_json = json.dumps(
            schema_payload,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        )

        return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    def create_snapshot(
        self,
        db: Session,
        template,
        user_id: Any,
        *,
        breaking_change: bool = False,
        risk_summary: dict[str, Any] | None = None,
    ) -> TemplateVersion:
        version_number = self.next_version_number(
            db,
            template.id,
        )

        schema_hash = self.compute_schema_hash(template)

        fields = sorted(
            template.fields,
            key=lambda field: field.order,
        )

        version = TemplateVersion(
            id=uuid.uuid4(),
            template_id=template.id,
            version_number=version_number,
            name=template.name,
            slug=template.slug,
            description=template.description,
            icon=template.icon,
            category=template.category,
            schema_hash=schema_hash,
            breaking_change=breaking_change,
            risk_summary=risk_summary or {},
            created_by=str(user_id),
        )

        for field in fields:
            f_type = getattr(field, "type", getattr(field, "field_type", None))
            f_group = getattr(field, "group", getattr(field, "group_name", None))
            version.fields.append(
                TemplateVersionField(
                    id=uuid.uuid4(),
                    key=field.key,
                    label=field.label,
                    type=f_type,
                    required=field.required,
                    translatable=field.translatable,
                    order=field.order,
                    group=f_group,
                    help_text=field.help_text,
                    config=field.config or {},
                )
            )

        db.add(version)
        db.flush()

        return version
