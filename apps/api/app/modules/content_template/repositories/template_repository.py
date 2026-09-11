import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.content_template.models import (
    ContentTemplate,
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
