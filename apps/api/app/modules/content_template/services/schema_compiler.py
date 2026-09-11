from typing import Any

from app.modules.content_template.domain.constants import (
    DEFAULT_GEO_BOUNDS,
)


def compile_field(field) -> dict[str, Any]:
    config = dict(field.config or {})

    field_type = getattr(field.field_type, "value", field.field_type)

    if field_type in {
        "IMAGE",
        "GALLERY",
    }:
        config.setdefault(
            "requireAltText",
            True,
        )

    if field_type in {
        "GEO_POINT",
        "MAP_REGION",
    }:
        config.setdefault(
            "bounds",
            DEFAULT_GEO_BOUNDS,
        )

    return {
        "key": field.key,
        "label": field.label,
        "type": field_type,
        "required": field.required,
        "translatable": field.translatable,
        "order": field.order,
        "group": getattr(field, "group_name", None),
        "helpText": getattr(field, "help_text", None),
        "config": config,
    }


def compile_template(template) -> dict[str, Any]:
    fields = sorted(
        template.fields,
        key=lambda item: item.order,
    )

    return {
        "template": {
            "id": str(template.id),
            "name": template.name,
            "slug": template.slug,
            "description": template.description,
            "icon": template.icon,
            "category": template.category,
            "status": template.status,
        },
        "fields": [
            compile_field(field)
            for field in fields
        ],
    }
