from __future__ import annotations

from typing import Any
from pydantic import BaseModel, ConfigDict


class PublicField(BaseModel):
    model_config = ConfigDict(extra="ignore")

    key: str
    label: str
    type: str
    value: Any = None
    group: str | None = None


class PublicContent(BaseModel):
    id: str
    slug: str
    template_id: str
    template_version: int
    locale: str

    name: str | None = None
    description: str | None = None

    fields: list[PublicField]

    canonical_url: str

    published_at: str | None = None

    seo_title: str | None = None
    seo_description: str | None = None

    breadcrumbs: list[dict[str, str]]


class SitemapItem(BaseModel):
    slug: str
    updated_at: str | None = None
