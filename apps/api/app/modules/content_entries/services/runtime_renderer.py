from __future__ import annotations

from typing import Any
from app.modules.content_entries.models.content_entry import ContentEntry
from app.modules.content_template.models.template_version import TemplateVersion


class RuntimeRenderer:
    def render(
        self,
        version: TemplateVersion,
        entry: ContentEntry,
        locale: str = "en",
    ) -> dict[str, Any]:
        output: list[dict[str, Any]] = []

        localized = (entry.locale_values or {}).get(locale, {})
        values = entry.values or {}

        for field in sorted(version.fields, key=lambda item: item.order):
            # Prefer localized value if available, else standard value
            value = localized.get(field.key, values.get(field.key))

            output.append(
                {
                    "key": field.key,
                    "label": field.label,
                    "type": field.type,
                    "required": field.required,
                    "group": field.group,
                    "value": value,
                    "config": field.config or {},
                }
            )

        return {
            "template": {
                "id": str(version.template_id),
                "version": version.version_number,
                "slug": version.slug,
            },
            "entry": {
                "id": str(entry.id),
                "slug": entry.slug,
                "title": entry.title,
            },
            "fields": output,
        }
