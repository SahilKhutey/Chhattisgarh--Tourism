from typing import Any
import uuid

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_serializer

from app.modules.content_template.domain.enums import (
    TemplateFieldType,
)


class TemplateFieldCreate(BaseModel):
    key: str = Field(
        min_length=2,
        max_length=64,
    )

    label: str = Field(
        min_length=1,
        max_length=160,
    )

    field_type: TemplateFieldType

    required: bool = False

    translatable: bool = True

    order: int = Field(
        ge=0,
    )

    group: str | None = Field(
        default=None,
        max_length=100,
    )

    help_text: str | None = Field(
        default=None,
        max_length=1000,
    )

    config: dict[str, Any] = Field(
        default_factory=dict,
    )


class TemplateFieldUpdate(BaseModel):
    key: str = Field(
        min_length=2,
        max_length=64,
    )

    label: str | None = Field(
        default=None,
        max_length=160,
    )

    required: bool | None = None

    translatable: bool | None = None

    order: int | None = Field(
        default=None,
        ge=0,
    )

    group: str | None = None

    help_text: str | None = None

    config: dict[str, Any] | None = None


class TemplateFieldResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    id: str | uuid.UUID
    key: str
    label: str
    field_type: str
    required: bool
    translatable: bool
    order: int
    group: str | None = Field(
        default=None,
        validation_alias=AliasChoices("group", "group_name"),
    )
    help_text: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)

    @field_serializer("id")
    def serialize_id(self, value: str | uuid.UUID) -> str:
        return str(value)


class TemplateFieldPatchRequest(BaseModel):
    upsert: list[TemplateFieldCreate] = Field(
        default_factory=list,
    )

    delete_keys: list[str] = Field(
        default_factory=list,
    )

    ordered_keys: list[str] = Field(
        default_factory=list,
    )
