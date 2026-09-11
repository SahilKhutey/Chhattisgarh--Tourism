from typing import Any
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

from .domain.validation import (
    validate_field_key,
    validate_field_type,
    validate_slug,
)


class TemplateMetadataInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(
        min_length=1,
        max_length=80,
    )

    slug: str = Field(
        min_length=1,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    icon: str | None = Field(
        default=None,
        max_length=100,
    )

    category: str | None = Field(
        default=None,
        max_length=100,
    )

    @field_validator("slug")
    @classmethod
    def slug_validator(cls, value: str):
        validate_slug(value)
        return value


class FieldInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID | None = None

    key: str = Field(
        min_length=1,
        max_length=100,
    )

    type: str

    label: str = Field(
        min_length=1,
        max_length=200,
    )

    helpText: str | None = None

    required: bool = False

    translatable: bool = True

    order: int = Field(
        ge=0,
    )

    groupId: UUID | None = None

    config: dict[str, Any] = Field(
        default_factory=dict,
    )

    @field_validator("key")
    @classmethod
    def key_validator(cls, value: str):
        validate_field_key(value)
        return value

    @field_validator("type")
    @classmethod
    def type_validator(cls, value: str):
        validate_field_type(value)
        return value


class GroupInput(BaseModel):
    id: UUID | None = None

    label: str = Field(
        min_length=1,
        max_length=100,
    )

    order: int = Field(
        ge=0,
    )


class UpdateTemplateInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=80,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    icon: str | None = None

    category: str | None = None

    revision: int = Field(
        ge=1,
    )


class ReplaceFieldsInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fields: list[FieldInput]

    groups: list[GroupInput] = Field(
        default_factory=list,
    )

    revision: int = Field(
        ge=1,
    )


class TemplateResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    name: str
    slug: str
    description: str | None
    icon: str | None
    category: str | None
    status: str
    current_version: int | None
    revision: int
