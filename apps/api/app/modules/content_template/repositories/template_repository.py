import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.modules.content_template.models import (
    ContentTemplate,
    TemplateField,
)


class TemplateRepository:

    def get(
        self,
        db: Session,
        template_id: uuid.UUID,
    ):
        return db.scalar(
            select(ContentTemplate)
            .where(
                ContentTemplate.id == template_id
            )
        )

    def get_by_slug(
        self,
        db: Session,
        slug: str,
    ):
        return db.scalar(
            select(ContentTemplate)
            .where(
                ContentTemplate.slug == slug
            )
        )

    def list(
        self,
        db: Session,
        *,
        offset: int = 0,
        limit: int = 50,
    ):
        statement = (
            select(ContentTemplate)
            .order_by(
                ContentTemplate.created_at.desc()
            )
            .offset(offset)
            .limit(limit)
        )

        return list(
            db.scalars(statement)
        )

    def add(
        self,
        db: Session,
        template: ContentTemplate,
    ):
        db.add(template)
        db.flush()

        return template

    def list_admin(
        self,
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        category: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ):
        statement = select(
            ContentTemplate,
            func.count(
                TemplateField.id
            ).label("field_count"),
        ).outerjoin(
            TemplateField,
            TemplateField.template_id
            == ContentTemplate.id,
        )

        if search:
            pattern = f"%{search.strip()}%"

            statement = statement.where(
                or_(
                    ContentTemplate.name.ilike(pattern),
                    ContentTemplate.slug.ilike(pattern),
                    ContentTemplate.description.ilike(pattern),
                )
            )

        if status:
            statement = statement.where(
                ContentTemplate.status == status
            )

        if category:
            statement = statement.where(
                ContentTemplate.category == category
            )

        statement = (
            statement
            .group_by(ContentTemplate.id)
            .order_by(
                ContentTemplate.updated_at.desc()
            )
            .offset(offset)
            .limit(limit)
        )

        return db.execute(statement).all()

    def count_admin(
        self,
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        category: str | None = None,
    ):
        statement = select(
            func.count(
                ContentTemplate.id
            )
        )

        if search:
            pattern = f"%{search.strip()}%"

            statement = statement.where(
                or_(
                    ContentTemplate.name.ilike(pattern),
                    ContentTemplate.slug.ilike(pattern),
                    ContentTemplate.description.ilike(pattern),
                )
            )

        if status:
            statement = statement.where(
                ContentTemplate.status == status
            )

        if category:
            statement = statement.where(
                ContentTemplate.category == category
            )

        return db.scalar(statement) or 0

    def counts(
        self,
        db: Session,
    ):
        rows = db.execute(
            select(
                ContentTemplate.status,
                func.count(ContentTemplate.id),
            )
            .group_by(
                ContentTemplate.status
            )
        ).all()

        return {
            status: count
            for status, count in rows
        }

    def get_for_update(
        self,
        db: Session,
        template_id: uuid.UUID | str,
    ) -> ContentTemplate | None:
        tid = uuid.UUID(str(template_id)) if isinstance(template_id, str) else template_id
        statement = select(ContentTemplate).where(ContentTemplate.id == tid)
        if db.bind and db.bind.dialect.name != "sqlite":
            statement = statement.with_for_update()
        return db.scalar(statement)

