from __future__ import annotations

from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ContentEntryCreate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    slug: str | None = Field(default=None, max_length=220)
    template_id: str | None = None
    values: dict[str, Any] = Field(default_factory=dict)
    data: dict[str, Any] | None = None
    locale_values: dict[str, dict[str, Any]] = Field(default_factory=dict)

    def model_post_init(self, __context: Any) -> None:
        if self.data and not self.values:
            # Flatten multilingual dictionaries like {"name": {"en": "Value"}} -> {"name": "Value"}
            flat_vals = {}
            for k, v in self.data.items():
                if isinstance(v, dict) and "en" in v:
                    flat_vals[k] = v["en"]
                else:
                    flat_vals[k] = v
            self.values = flat_vals

        if not self.title:
            if "name" in self.values:
                self.title = str(self.values["name"])
            elif "title" in self.values:
                self.title = str(self.values["title"])
            elif self.slug:
                self.title = self.slug.replace("-", " ").title()
            else:
                self.title = "Untitled Entry"


class ContentEntryUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    slug: str | None = Field(default=None, max_length=220)
    values: dict[str, Any] | None = None
    data: dict[str, Any] | None = None
    locale_values: dict[str, dict[str, Any]] | None = None
    revision: int | None = Field(default=None, ge=1)

    def model_post_init(self, __context: Any) -> None:
        if self.data and not self.values:
            flat_vals = {}
            for k, v in self.data.items():
                if isinstance(v, dict) and "en" in v:
                    flat_vals[k] = v["en"]
                else:
                    flat_vals[k] = v
            self.values = flat_vals


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
