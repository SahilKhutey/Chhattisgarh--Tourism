from __future__ import annotations

import os
from typing import Any


def get_site_url() -> str:
    return (
        os.getenv("SITE_URL")
        or os.getenv("NEXT_PUBLIC_SITE_URL")
        or "http://localhost:3000"
    ).rstrip("/")


def build_canonical_url(slug: str, locale: str, route: str = "destinations") -> str:
    site_url = get_site_url()
    return f"{site_url}/{locale}/{route}/{slug}"


def resolve_seo_metadata(
    slug: str,
    title_val: str | None,
    name_val: str | None,
    desc_val: str | None,
    fields: list[dict[str, Any]],
) -> tuple[str, str | None, str | None, str | None]:
    """
    Returns (resolved_name, resolved_description, seo_title, seo_description).
    """
    name = name_val or title_val or slug
    description = desc_val

    # Check if explicit seo fields exist in fields
    seo_title = None
    seo_desc = None
    for field in fields:
        k = field.get("key")
        v = field.get("value")
        if k in {"seo_title", "meta_title"} and isinstance(v, str):
            seo_title = v
        elif k in {"seo_description", "meta_description"} and isinstance(v, str):
            seo_desc = v

    final_title = seo_title or name
    final_desc = seo_desc or description

    return name, description, final_title, final_desc


def build_breadcrumbs(
    name: str,
    slug: str,
    locale: str,
    route: str = "destinations",
) -> list[dict[str, str]]:
    route_label = route.capitalize()
    return [
        {"label": "Home", "href": f"/{locale}"},
        {"label": route_label, "href": f"/{locale}/{route}"},
        {"label": name, "href": f"/{locale}/{route}/{slug}"},
    ]
