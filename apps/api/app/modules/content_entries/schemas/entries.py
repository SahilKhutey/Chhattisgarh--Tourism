from __future__ import annotations

from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ContentEntryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    slug: str | None = Field(default=None, max_length=220)
    values: dict[str, Any] = Field(default_factory=dict)
    locale_values: dict[str, dict[str, Any]] = Field(default_factory=dict)


class ContentEntryUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    slug: str | None = Field(default=None, max_length=220)
    values: dict[str, Any] | None = None
    locale_values: dict[str, dict[str, Any]] | None = None
    revision: int = Field(ge=1)


class ContentEntryResponse(BaseModel):
    id: str
    template_id: str
    template_version_id: str
    slug: str
    title: str
    status: str
    values: dict[str, Any]
    locale_values: dict[str, dict[str, Any]]
    revision: int
    created_by: str
    updated_by: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    schema_state: str = "CURRENT"
    template_version_number: int | None = None
    template_name: str | None = None
    live_template_version: int | None = None

    model_config = ConfigDict(from_attributes=True)


class ContentEntryListResponse(BaseModel):
    items: list[ContentEntryResponse]
    total: int
    page: int
    page_size: int


class RuntimeFieldSchema(BaseModel):
    key: str
    label: str
    type: str
    required: bool
    translatable: bool
    order: int
    group: str | None = None
    helpText: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)


class RuntimeSchemaTemplateInfo(BaseModel):
    id: str
    slug: str
    version: int


class RuntimeSchemaResponse(BaseModel):
    template: RuntimeSchemaTemplateInfo
    fields: list[RuntimeFieldSchema]


class PublicContentField(BaseModel):
    key: str
    label: str
    type: str
    required: bool
    group: str | None = None
    value: Any = None
    config: dict[str, Any] = Field(default_factory=dict)


class PublicContentResponse(BaseModel):
    template: dict[str, Any]
    entry: dict[str, Any]
    fields: list[PublicContentField]
