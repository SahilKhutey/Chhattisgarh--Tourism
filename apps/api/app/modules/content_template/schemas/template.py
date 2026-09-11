import uuid
from pydantic import BaseModel, ConfigDict, Field, field_serializer

from .field import TemplateFieldResponse


class TemplateCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=160,
    )

    slug: str = Field(
        min_length=2,
        max_length=180,
    )

    description: str | None = None

    icon: str | None = None

    category: str | None = None


class TemplateUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    icon: str | None = None
    category: str | None = None


class TemplateResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: str | uuid.UUID
    name: str
    slug: str
    description: str | None
    icon: str | None
    category: str | None
    status: str
    fields: list[TemplateFieldResponse] = Field(default_factory=list)

    @field_serializer("id")
    def serialize_id(self, value: str | uuid.UUID) -> str:
        return str(value)
