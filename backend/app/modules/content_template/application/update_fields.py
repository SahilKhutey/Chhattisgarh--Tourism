from uuid import UUID, uuid4

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from ..domain.errors import (
    TemplateConcurrencyError,
    TemplateNotFoundError,
)
from ..domain.validation import (
    validate_config,
    validate_field_key,
)
from ..infrastructure.models import (
    ContentTemplateModel,
    TemplateFieldModel,
    TemplateGroupModel,
)
from ..schemas import ReplaceFieldsInput


async def replace_fields(
    session: AsyncSession,
    template_id: UUID,
    data: ReplaceFieldsInput,
) -> ContentTemplateModel:
    template = await session.get(
        ContentTemplateModel,
        template_id,
    )

    if template is None:
        raise TemplateNotFoundError("Template not found.")

    if template.revision != data.revision:
        raise TemplateConcurrencyError("Template was modified by another user.")

    keys: set[str] = set()

    for field in data.fields:
        validate_field_key(field.key)

        if field.key in keys:
            raise ValueError(f"Duplicate field key: {field.key}")

        keys.add(field.key)

        validate_config(
            field.type,
            field.config,
        )

    await session.execute(
        delete(TemplateFieldModel).where(
            TemplateFieldModel.template_id == template_id
        )
    )

    await session.execute(
        delete(TemplateGroupModel).where(
            TemplateGroupModel.template_id == template_id
        )
    )

    for group in data.groups:
        model = TemplateGroupModel(
            id=group.id or uuid4(),
            template_id=template_id,
            label=group.label,
            display_order=group.order,
        )
        session.add(model)

    await session.flush()

    for field in data.fields:
        model = TemplateFieldModel(
            id=field.id or uuid4(),
            template_id=template_id,
            group_id=field.groupId,
            key=field.key,
            type=field.type,
            label=field.label,
            help_text=field.helpText,
            required=field.required,
            translatable=field.translatable,
            display_order=field.order,
            config=field.config,
        )
        session.add(model)

    template.revision += 1

    await session.commit()

    return template
