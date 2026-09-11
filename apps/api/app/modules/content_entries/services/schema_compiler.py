from __future__ import annotations

from typing import Any
from app.modules.content_template.models.template_version import TemplateVersion


class EntrySchemaCompiler:
    def compile(self, version: TemplateVersion) -> dict[str, Any]:
        properties: dict[str, Any] = {}
        required: list[str] = []

        for field in version.fields:
            properties[field.key] = self._field_to_schema(field)
            if field.required:
                required.append(field.key)

        return {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": properties,
            "required": required,
            "additionalProperties": False,
        }

    def _field_to_schema(self, field: Any) -> dict[str, Any]:
        mapping: dict[str, dict[str, Any]] = {
            "TEXT": {"type": "string"},
            "TEXTAREA": {"type": "string"},
            "RICHTEXT": {"type": "string"},
            "NUMBER": {"type": "number"},
            "BOOLEAN": {"type": "boolean"},
            "DATE": {"type": "string", "format": "date"},
            "DATETIME": {"type": "string", "format": "date-time"},
            "TIME": {"type": "string"},
            "TAGS": {"type": "array", "items": {"type": "string"}},
            "GALLERY": {"type": "array"},
            "IMAGE": {"type": "object"},
            "VIDEO": {"type": "object"},
            "AUDIO": {"type": "object"},
            "GEO_POINT": {
                "type": "object",
                "properties": {
                    "latitude": {"type": "number"},
                    "longitude": {"type": "number"},
                },
                "required": ["latitude", "longitude"],
            },
            "MAP_REGION": {"type": "object"},
            "RELATION": {"type": "array", "items": {"type": "string"}},
            "DROPDOWN": {"type": "string"},
            "MULTI_SELECT": {"type": "array", "items": {"type": "string"}},
        }

        schema = dict(mapping.get(field.type, {"type": "string"}))

        if field.type in {"DROPDOWN", "MULTI_SELECT"}:
            enum_values = [
                option["value"]
                for option in (field.config or {}).get("options", [])
                if isinstance(option, dict) and "value" in option
            ]
            if field.type == "DROPDOWN":
                schema["enum"] = enum_values
            else:
                schema["items"] = {"type": "string", "enum": enum_values}

        return schema
