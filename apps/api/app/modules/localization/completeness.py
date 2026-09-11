from __future__ import annotations

from typing import Any, Iterable


def calculate_completeness(
    fields: Iterable[Any],
    translations: Iterable[Any],
    locale_code: str,
    base_values: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if base_values is not None:
        translatable_fields = [
            field
            for field in fields
            if getattr(field, "translatable", False)
            and (
                getattr(field, "required", False)
                or (getattr(field, "key", None) in base_values and str(base_values[getattr(field, "key", None)]).strip())
            )
        ]
    else:
        translatable_fields = [
            field
            for field in fields
            if getattr(field, "translatable", False)
        ]

    if not translatable_fields:
        return {
            "locale_code": locale_code,
            "total_fields": 0,
            "translated_fields": 0,
            "percentage": 100.0,
            "complete": True,
        }

    translated_keys = {
        getattr(item, "field_key", None)
        for item in translations
        if (
            getattr(item, "locale_code", None) == locale_code
            and getattr(item, "value", None)
            and str(getattr(item, "value", "")).strip()
        )
    }

    if base_values and locale_code == "en":
        for k, v in base_values.items():
            if v is not None and str(v).strip():
                translated_keys.add(k)

    translated = sum(
        1
        for field in translatable_fields
        if getattr(field, "key", None) in translated_keys
    )

    total = len(translatable_fields)
    percentage = (translated / total) * 100.0 if total > 0 else 100.0

    return {
        "locale_code": locale_code,
        "total_fields": total,
        "translated_fields": translated,
        "percentage": round(percentage, 2),
        "complete": translated == total,
    }
