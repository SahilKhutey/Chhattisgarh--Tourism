from uuid import uuid4

from ..domain.models import ContentTemplate, TemplateStatus
from ..schemas import TemplateMetadataInput
from ..infrastructure.repository import TemplateRepository


class CreateTemplateService:

    def __init__(self, repository: TemplateRepository):
        self.repository = repository

    async def execute(
        self,
        data: TemplateMetadataInput,
    ) -> ContentTemplate:

        existing = await self.repository.get_by_slug(data.slug)

        if existing:
            raise ValueError(
                f"Template slug '{data.slug}' already exists"
            )

        template = ContentTemplate(
            id=str(uuid4()),
            name=data.name,
            slug=data.slug,
            description=data.description,
            icon=data.icon,
            category=data.category,
            status=TemplateStatus.DRAFT,
            fields=[],
        )

        return await self.repository.save(template)
