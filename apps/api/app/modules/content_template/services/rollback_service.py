from __future__ import annotations

from typing import Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.content_template.models.template_version import TemplateVersion
from app.modules.content_template.services.audit_service import TemplateAuditService


class TemplateRollbackService:

    def __init__(self):
        self.audit_service = TemplateAuditService()

    def rollback(
        self,
        db: Session,
        template: Any,
        target_version: TemplateVersion,
        user_id: Any,
    ) -> TemplateVersion:
        if target_version.template_id != template.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Version does not belong to template.",
            )

        previous_published_id = template.published_version_id

        if previous_published_id == target_version.id:
            return target_version

        template.published_version_id = target_version.id
        template.status = "PUBLISHED"
        template.updated_by = user_id

        self.audit_service.record(
            db,
            event_type="TEMPLATE_ROLLBACK",
            actor_id=user_id,
            entity_type="CONTENT_TEMPLATE",
            entity_id=template.id,
            payload={
                "from_version_id": str(previous_published_id) if previous_published_id else None,
                "to_version_number": target_version.version_number,
                "to_version_id": str(target_version.id),
            },
        )

        db.flush()
        return target_version
