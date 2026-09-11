from abc import ABC, abstractmethod

from ..domain.models import ContentTemplate


class TemplateRepository(ABC):

    @abstractmethod
    async def get_by_id(
        self,
        template_id: str,
    ) -> ContentTemplate | None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_slug(
        self,
        slug: str,
    ) -> ContentTemplate | None:
        raise NotImplementedError

    @abstractmethod
    async def save(
        self,
        template: ContentTemplate,
    ) -> ContentTemplate:
        raise NotImplementedError
