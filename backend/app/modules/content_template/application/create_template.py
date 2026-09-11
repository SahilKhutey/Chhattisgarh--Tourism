from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .get_template import get_template
from ..domain.errors import TemplateConflictError
from ..domain.validation import validate_slug
from ..infrastructure.models import ContentTemplateModel
from ..schemas import TemplateMetadataInput


async def create_template(
    session: AsyncSession,
    data: TemplateMetadataInput,
) -> ContentTemplateModel:

    validate_slug(data.slug)

    template = ContentTemplateModel(
        name=data.name,
        slug=data.slug,
        description=data.description,
        icon=data.icon,
        category=data.category,
        status="DRAFT",
        current_version=None,
        revision=1,
    )

    session.add(template)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()

        raise TemplateConflictError(
            "A template with this slug already exists."
        ) from exc

    return await get_template(session, template.id)
