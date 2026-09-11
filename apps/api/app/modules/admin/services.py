from math import ceil

from sqlalchemy.orm import Session

from app.modules.content_template.repositories.template_repository import (
    TemplateRepository,
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
    ):
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
