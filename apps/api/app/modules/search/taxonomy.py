from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class TaxonomyTermData:
    slug: str
    name: str
    category: str
    parent_slug: str | None = None
    locale: str = "en"
    sort_order: int = 0


CANONICAL_TAXONOMY_CATEGORIES = {
    "nature": ["waterfalls", "forests", "lakes", "caves"],
    "heritage": ["archaeological", "architecture", "museums"],
    "spiritual": ["temples", "pilgrimage", "religious-sites"],
    "wildlife": ["sanctuary", "national-park", "biodiversity"],
    "adventure": ["trekking", "camping", "water-activities"],
    "experiences": ["culture", "crafts", "festivals", "cuisine"],
}

# Mapping common terms/slugs to canonical content_type
CONTENT_TYPE_MAP = {
    "destination": "destination",
    "attraction": "destination",
    "place": "destination",
    "nature": "nature",
    "waterfall": "nature",
    "waterfalls": "nature",
    "heritage": "heritage",
    "temple": "spiritual",
    "spiritual": "spiritual",
    "wildlife": "wildlife",
    "adventure": "adventure",
    "experience": "experiences",
    "festival": "experiences",
    "craft": "experiences",
}


def resolve_content_type(
    template_slug: str | None,
    template_name: str | None,
    template_category: str | None = None,
) -> str:
    """
    Resolves the canonical content type from template metadata rather than falling back to 'unknown'.
    """
    candidates = [
        (template_category or "").lower().strip(),
        (template_slug or "").lower().strip(),
        (template_name or "").lower().strip(),
    ]

    for candidate in candidates:
        if not candidate:
            continue
        for key, target_type in CONTENT_TYPE_MAP.items():
            if key in candidate:
                return target_type

    if template_category and template_category.strip():
        return template_category.strip().lower()

    if template_slug and template_slug.strip():
        return template_slug.strip().lower()

    return "destination"
