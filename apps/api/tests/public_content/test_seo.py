from __future__ import annotations

from app.modules.public_content.seo import (
    build_breadcrumbs,
    build_canonical_url,
    resolve_seo_metadata,
)


def test_build_canonical_url():
    url = build_canonical_url("sirpur", "hi", "destinations")
    assert "/hi/destinations/sirpur" in url


def test_build_breadcrumbs():
    crumbs = build_breadcrumbs("Barnawapara", "barnawapara", "en", "destinations")
    assert len(crumbs) == 3
    assert crumbs[0] == {"label": "Home", "href": "/en"}
    assert crumbs[1] == {"label": "Destinations", "href": "/en/destinations"}
    assert crumbs[2] == {"label": "Barnawapara", "href": crumbs[2]["href"]}


def test_resolve_seo_metadata_fallback():
    name, desc, title, s_desc = resolve_seo_metadata(
        slug="chitrakote",
        title_val="Chitrakote Falls",
        name_val=None,
        desc_val="Niagara of India",
        fields=[],
    )
    assert name == "Chitrakote Falls"
    assert desc == "Niagara of India"
    assert title == "Chitrakote Falls"
    assert s_desc == "Niagara of India"


def test_resolve_seo_metadata_explicit_fields():
    fields = [
        {"key": "seo_title", "value": "Custom SEO Title"},
        {"key": "seo_description", "value": "Custom SEO Description"},
    ]
    name, desc, title, s_desc = resolve_seo_metadata(
        slug="chitrakote",
        title_val="Chitrakote Falls",
        name_val=None,
        desc_val="Niagara of India",
        fields=fields,
    )
    assert title == "Custom SEO Title"
    assert s_desc == "Custom SEO Description"
