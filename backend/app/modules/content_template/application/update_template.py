from uuid import UUID

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from ..domain.errors import (
    TemplateConcurrencyError,
    TemplateNotFoundError,
)
from ..infrastructure.models import ContentTemplateModel
from ..schemas import UpdateTemplateInput


async def update_template(
    session: AsyncSession,
    template_id: UUID,
    data: UpdateTemplateInput,
) -> ContentTemplateModel:

    values = {
        key: value
        for key, value in data.model_dump(exclude_unset=True).items()
        if key != "revision"
    }

    if not values:
        raise ValueError("No template fields supplied.")

    values["revision"] = data.revision + 1

    result = await session.execute(
        update(ContentTemplateModel)
        .where(
            ContentTemplateModel.id == template_id,
            ContentTemplateModel.revision == data.revision,
        )
        .values(**values)
        .returning(ContentTemplateModel)
    )

    template = result.scalar_one_or_none()

    if template is None:
        exists = await session.get(ContentTemplateModel, template_id)

        if exists is None:
            raise TemplateNotFoundError("Template not found.")

        raise TemplateConcurrencyError(
            "Template was modified by another user."
        )

    await session.commit()

    return template
