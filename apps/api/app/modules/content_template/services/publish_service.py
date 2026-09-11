from __future__ import annotations

from typing import Any
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.content_template.models.template_version import TemplateVersion
from app.modules.content_template.services.audit_service import TemplateAuditService
from app.modules.content_template.services.version_diff import (
    compare_versions,
    summarize_diff,
)
from app.modules.content_template.services.version_service import (
    TemplateVersionService,
)
from app.modules.content_template.validators.field_validator import (
    validate_fields,
)


class TemplatePublishService:

    def __init__(self):
        self.version_service = TemplateVersionService()
        self.audit_service = TemplateAuditService()

    def publish(
        self,
        db: Session,
        template: Any,
        user_id: Any,
    ) -> TemplateVersion:
        if not template.fields:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A template must contain at least one field to publish.",
            )

        errors = validate_fields(template.fields)
        if errors:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Cannot publish invalid template.",
                    "errors": errors,
                },
            )

        previous = None
        if template.published_version_id:
            previous = db.scalar(
                select(TemplateVersion)
                .options(selectinload(TemplateVersion.fields))
                .where(TemplateVersion.id == template.published_version_id)
            )

        preview_version = self.version_service.create_snapshot(
            db,
            template,
            user_id,
        )

        breaking = False
        risk: dict[str, Any] = {
            "breaking": False,
            "risk_level": "LOW",
            "actions": [],
            "added": len(preview_version.fields),
            "removed": 0,
            "changed": 0,
            "reordered": 0,
        }

        if previous:
            diff = compare_versions(
                previous,
                preview_version,
            )
            breaking = diff.breaking
            risk = summarize_diff(diff)

        preview_version.breaking_change = breaking
        preview_version.risk_summary = risk

        template.published_version_id = preview_version.id
        template.status = "PUBLISHED"
        template.updated_by = user_id

        self.audit_service.record(
            db,
            event_type="TEMPLATE_PUBLISHED",
            actor_id=user_id,
            entity_type="CONTENT_TEMPLATE",
            entity_id=template.id,
            payload={
                "version": preview_version.version_number,
                "schema_hash": preview_version.schema_hash,
                "breaking": breaking,
            },
        )

        db.flush()
        return preview_version
