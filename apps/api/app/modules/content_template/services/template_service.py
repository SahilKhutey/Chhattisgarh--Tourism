import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_template.domain.enums import (
    TemplateStatus,
)
from app.modules.content_template.domain.exceptions import (
    TemplateAlreadyExistsError,
    TemplateNotFoundError,
    TemplatePublishError,
    TemplateValidationError,
)
from app.modules.content_template.models import (
    ContentTemplate,
    TemplateField,
)
from app.modules.content_template.repositories.template_repository import (
    TemplateRepository,
)
from app.modules.content_template.schemas.field import (
    TemplateFieldPatchRequest,
)
from app.modules.content_template.validators.template_validator import (
    validate_field_key,
    validate_template_fields,
)


class TemplateService:

    def __init__(self):
        self.repository = TemplateRepository()

    def create(
        self,
        db: Session,
        *,
        data,
        actor_id: uuid.UUID | None,
    ):
        existing = self.repository.get_by_slug(
            db,
            data.slug,
        )

        if existing:
            raise TemplateAlreadyExistsError(
                "Template slug already exists."
            )

        template = ContentTemplate(
            name=data.name,
            slug=data.slug,
            description=data.description,
            icon=data.icon,
            category=data.category,
            status=TemplateStatus.DRAFT.value,
            created_by=actor_id,
            updated_by=actor_id,
        )

        return self.repository.add(
            db,
            template,
        )

    def get(
        self,
        db: Session,
        template_id: uuid.UUID,
    ):
        template = self.repository.get(
            db,
            template_id,
        )

        if not template:
            raise TemplateNotFoundError(
                "Template not found."
            )

        return template

    def update_fields(
        self,
        db: Session,
        template_id: uuid.UUID,
        data: TemplateFieldPatchRequest,
        actor_id: uuid.UUID | None,
    ):
        template = self.get(
            db,
            template_id,
        )

        if template.status == TemplateStatus.PUBLISHED.value:
            raise TemplatePublishError(
                "Published templates cannot be modified directly."
            )

        upsert_keys = [incoming.key for incoming in data.upsert]
        if len(upsert_keys) != len(set(upsert_keys)):
            raise TemplateValidationError("Template field keys must be unique.")

        for incoming in data.upsert:
            validate_field_key(incoming.key)

        existing_fields = {
            field.key: field
            for field in template.fields
        }

        for key in data.delete_keys:
            field = existing_fields.get(key)

            if field:
                db.delete(field)

        db.flush()

        for incoming in data.upsert:
            field = existing_fields.get(
                incoming.key
            )

            field_type = getattr(incoming.field_type, "value", incoming.field_type)

            if field:
                field.label = incoming.label
                field.field_type = field_type
                field.required = incoming.required
                field.translatable = incoming.translatable
                field.order = incoming.order
                field.group_name = incoming.group
                field.help_text = incoming.help_text
                field.config = incoming.config
            else:
                new_field = TemplateField(
                    template_id=template.id,
                    key=incoming.key,
                    label=incoming.label,
                    field_type=field_type,
                    required=incoming.required,
                    translatable=incoming.translatable,
                    order=incoming.order,
                    group_name=incoming.group,
                    help_text=incoming.help_text,
                    config=incoming.config,
                )
                db.add(new_field)

        db.flush()

        if data.ordered_keys:
            fields = list(
                db.scalars(
                    select(TemplateField)
                    .where(
                        TemplateField.template_id
                        == template.id
                    )
                )
            )

            by_key = {
                field.key: field
                for field in fields
            }

            for index, key in enumerate(
                data.ordered_keys
            ):
                field = by_key.get(key)

                if field:
                    field.order = index

        template.updated_by = actor_id

        db.flush()

        updated_fields = list(
            db.scalars(
                select(TemplateField)
                .where(TemplateField.template_id == template.id)
                .order_by(TemplateField.order)
            )
        )

        validate_template_fields(
            updated_fields
        )

        return template

    def publish(
        self,
        db: Session,
        template_id: uuid.UUID,
        actor_id: uuid.UUID | None,
    ):
        template = self.get(
            db,
            template_id,
        )

        if not template.fields:
            raise TemplatePublishError(
                "A template must contain at least one field."
            )

        validate_template_fields(
            template.fields
        )

        template.status = (
            TemplateStatus.PUBLISHED.value
        )

        template.updated_by = actor_id

        db.flush()

        return template
