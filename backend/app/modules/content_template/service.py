from typing import Any


def build_template_schema(template: Any) -> dict[str, Any]:
    fields = sorted(
        template.fields or [],
        key=lambda field: field.display_order,
    )

    groups = sorted(
        template.groups or [],
        key=lambda group: group.display_order,
    )

    return {
        "id": str(template.id),
        "name": template.name,
        "slug": template.slug,
        "description": template.description,
        "icon": template.icon,
        "category": template.category,
        "status": template.status,
        "revision": template.revision,
        "current_version": getattr(template, "current_version", None),
        "fields": [
            {
                "id": str(field.id),
                "key": field.key,
                "type": field.type,
                "label": field.label,
                "helpText": field.help_text,
                "required": field.required,
                "translatable": field.translatable,
                "order": field.display_order,
                "groupId": (
                    str(field.group_id)
                    if field.group_id
                    else None
                ),
                "config": field.config,
            }
            for field in fields
        ],
        "groups": [
            {
                "id": str(group.id),
                "label": group.label,
                "order": group.display_order,
            }
            for group in groups
        ],
    }
