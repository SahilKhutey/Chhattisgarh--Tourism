from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import (
    ContentTemplateModel,
    TemplateFieldModel,
    TemplateGroupModel,
)


class SQLAlchemyTemplateRepository:

    def __init__(
        self,
        session: AsyncSession,
    ):
        self.session = session

    async def get_by_id(
        self,
        template_id: UUID,
    ) -> ContentTemplateModel | None:
        result = await self.session.execute(
            select(ContentTemplateModel)
            .options(
                selectinload(ContentTemplateModel.fields),
                selectinload(ContentTemplateModel.groups),
            )
            .where(ContentTemplateModel.id == template_id)
        )

        return result.scalar_one_or_none()

    async def get_by_slug(
        self,
        slug: str,
    ) -> ContentTemplateModel | None:
        result = await self.session.execute(
            select(ContentTemplateModel)
            .options(
                selectinload(ContentTemplateModel.fields),
                selectinload(ContentTemplateModel.groups),
            )
            .where(ContentTemplateModel.slug == slug)
        )

        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        search: str | None = None,
        status: str | None = None,
        category: str | None = None,
        offset: int = 0,
        limit: int = 25,
    ) -> list[ContentTemplateModel]:
        query = select(ContentTemplateModel).options(
            selectinload(ContentTemplateModel.fields),
            selectinload(ContentTemplateModel.groups),
        )

        if search:
            pattern = f"%{search}%"
            query = query.where(
                (
                    ContentTemplateModel.name.ilike(pattern)
                    | ContentTemplateModel.slug.ilike(pattern)
                )
            )

        if status and status != "ALL":
            query = query.where(ContentTemplateModel.status == status)

        if category and category != "ALL":
            query = query.where(ContentTemplateModel.category == category)

        query = (
            query.order_by(ContentTemplateModel.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(query)

        return list(result.scalars().all())

    async def add(
        self,
        template: ContentTemplateModel,
    ) -> ContentTemplateModel:
        self.session.add(template)
        await self.session.flush()
        return template
