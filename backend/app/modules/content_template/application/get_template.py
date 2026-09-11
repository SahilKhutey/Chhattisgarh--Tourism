from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..domain.errors import TemplateNotFoundError
from ..infrastructure.models import ContentTemplateModel


async def get_template(
    session: AsyncSession,
    template_id: UUID,
) -> ContentTemplateModel:

    result = await session.execute(
        select(ContentTemplateModel)
        .options(
            selectinload(ContentTemplateModel.fields),
            selectinload(ContentTemplateModel.groups),
        )
        .where(ContentTemplateModel.id == template_id)
    )

    template = result.scalar_one_or_none()

    if template is None:
        raise TemplateNotFoundError("Template not found.")

    return template
