from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AdminTemplateItem(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None
    icon: str | None
    category: str | None
    status: str
    field_count: int
    created_at: datetime
    updated_at: datetime


class AdminTemplateListResponse(BaseModel):
    items: list[AdminTemplateItem]

    page: int
    page_size: int

    total: int
    total_pages: int

    draft_count: int
    published_count: int
    archived_count: int
