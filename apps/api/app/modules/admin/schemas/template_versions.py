from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TemplateVersionFieldResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    label: str
    type: str
    required: bool
    translatable: bool
    order: int
    group: str | None = None
    helpText: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)


class TemplateVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    template_id: str
    version_number: int

    name: str
    slug: str
    description: str | None = None
    icon: str | None = None
    category: str | None = None

    schema_hash: str

    breaking_change: bool = False
    risk_summary: dict[str, Any] = Field(default_factory=dict)

    created_by: str
    created_at: datetime
    status: str = "PUBLISHED"

    fields: list[TemplateVersionFieldResponse] = Field(default_factory=list)


class TemplateVersionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version_number: int
    schema_hash: str
    breaking_change: bool
    risk_summary: dict[str, Any] = Field(default_factory=dict)
    created_by: str
    created_at: datetime
    is_published: bool


class TemplateVersionListResponse(BaseModel):
    items: list[TemplateVersionListItem]
    total: int


class RollbackRequest(BaseModel):
    version_number: int = Field(ge=1)
