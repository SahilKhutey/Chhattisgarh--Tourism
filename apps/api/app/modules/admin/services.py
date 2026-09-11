import uuid
from math import ceil
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.admin.schemas.template_builder import (
    TemplateDraftUpdate,
    TemplateFieldInput,
    TemplateMetadataUpdate,
)
from app.modules.content_template.models import ContentTemplate, TemplateField
from app.modules.content_template.repositories.template_repository import (
    TemplateRepository,
)
from app.modules.content_template.validators.field_validator import (
    validate_fields,
)


class AdminTemplateService:

    def __init__(self):
        self.repository = TemplateRepository()

    def list_templates(
        self,
        db: Session,
        *,
        search: str | None,
        status: str | None,
        category: str | None,
        page: int,
        page_size: int,
    ) -> dict[str, Any]:
        offset = (page - 1) * page_size

        rows = self.repository.list_admin(
            db,
            search=search,
            status=status,
            category=category,
            offset=offset,
            limit=page_size,
        )

        total = self.repository.count_admin(
            db,
            search=search,
            status=status,
            category=category,
        )

        counts = self.repository.counts(db)

        return {
            "items": [
                {
                    "id": template.id,
                    "name": template.name,
                    "slug": template.slug,
                    "description": template.description,
                    "icon": template.icon,
                    "category": template.category,
                    "status": template.status,
                    "field_count": field_count,
                    "created_at": template.created_at,
                    "updated_at": template.updated_at,
                }
                for template, field_count in rows
            ],
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": ceil(total / page_size) if total else 0,
            "draft_count": counts.get("DRAFT", 0),
            "published_count": counts.get("PUBLISHED", 0),
            "archived_count": counts.get("ARCHIVED", 0),
        }

    def get_template(
        self,
        db: Session,
        template_id: UUID | str,
    ) -> ContentTemplate:
        tid = UUID(str(template_id)) if isinstance(template_id, str) else template_id
        template = self.repository.get(db, tid)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found.",
            )
        return template

    def format_template_for_builder(
        self,
        template: ContentTemplate,
    ) -> dict[str, Any]:
        sorted_fields = sorted(template.fields, key=lambda f: f.order)
        return {
            "id": str(template.id),
            "name": template.name,
            "slug": template.slug,
            "description": template.description,
            "icon": template.icon,
            "category": template.category,
            "status": template.status,
            "fields": [
                {
                    "key": field.key,
                    "label": field.label,
                    "type": field.field_type,
                    "required": field.required,
                    "translatable": field.translatable,
                    "order": field.order,
                    "group": field.group_name,
                    "helpText": field.help_text,
                    "config": field.config or {},
                }
                for field in sorted_fields
            ],
            "updated_at": (
                template.updated_at.isoformat()
                if template.updated_at
                else None
            ),
        }

    def update_metadata(
        self,
        db: Session,
        template: ContentTemplate,
        metadata: TemplateMetadataUpdate | dict[str, Any],
        actor_id: UUID | None = None,
    ) -> ContentTemplate:
        if template.status == "PUBLISHED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Published templates cannot be modified directly. "
                    "Create a new draft version."
                ),
            )

        meta_dict = metadata.model_dump() if hasattr(metadata, "model_dump") else dict(metadata)

        new_slug = meta_dict.get("slug")
        if new_slug and new_slug != template.slug:
            existing = self.repository.get_by_slug(db, new_slug)
            if existing and existing.id != template.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Template slug already exists.",
                )
            template.slug = new_slug

        if "name" in meta_dict and meta_dict["name"]:
            template.name = meta_dict["name"]
        if "description" in meta_dict:
            template.description = meta_dict["description"]
        if "icon" in meta_dict:
            template.icon = meta_dict["icon"]
        if "category" in meta_dict:
            template.category = meta_dict["category"]

        template.updated_by = actor_id
        db.flush()
        return template

    def replace_fields(
        self,
        db: Session,
        template: ContentTemplate,
        fields: list[TemplateFieldInput],
        actor_id: UUID | None = None,
    ) -> ContentTemplate:
        if template.status == "PUBLISHED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Published templates cannot be modified directly. "
                    "Create a new draft version."
                ),
            )

        errors = validate_fields(fields)
        if errors:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Invalid template fields.",
                    "errors": errors,
                },
            )

        # Clear existing fields
        for existing in list(template.fields):
            db.delete(existing)
        db.flush()

        # Add new fields
        for field_input in fields:
            cfg = (
                field_input.config.model_dump(exclude_none=True)
                if hasattr(field_input.config, "model_dump")
                else dict(field_input.config)
            )

            # Security: enforce require_alt_text on backend
            if field_input.type in {"IMAGE", "GALLERY"}:
                cfg["require_alt_text"] = True

            new_field = TemplateField(
                id=uuid.uuid4(),
                template_id=template.id,
                key=field_input.key,
                label=field_input.label,
                field_type=field_input.type,
                required=field_input.required,
                translatable=field_input.translatable,
                order=field_input.order,
                group_name=field_input.group,
                help_text=field_input.helpText,
                config=cfg,
            )
            db.add(new_field)

        template.updated_by = actor_id
        db.flush()
        db.refresh(template)
        return template

    def update_draft(
        self,
        db: Session,
        template: ContentTemplate,
        payload: TemplateDraftUpdate,
        actor_id: UUID | None = None,
    ) -> ContentTemplate:
        self.update_metadata(db, template, payload.metadata, actor_id=actor_id)
        self.replace_fields(db, template, payload.fields, actor_id=actor_id)
        db.flush()
        return template

    def validate_template(
        self,
        db: Session,
        template: ContentTemplate,
    ) -> dict[str, Any]:
        errors = validate_fields(template.fields)

        if not template.name or not template.name.strip():
            errors.append("Template name is required.")
        if not template.slug or not template.slug.strip():
            errors.append("Template slug is required.")

        warnings: list[str] = []
        if not template.description:
            warnings.append("Template description is recommended.")
        if not template.category:
            warnings.append("Template category is recommended.")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
        }

    def publish_template(
        self,
        db: Session,
        template: ContentTemplate,
        actor_id: UUID | None = None,
    ) -> ContentTemplate:
        if template.status == "PUBLISHED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Template is already published.",
            )

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

        template.status = "PUBLISHED"
        template.updated_by = actor_id
        db.flush()
        return template
