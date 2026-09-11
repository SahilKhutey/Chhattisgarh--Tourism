from collections import Counter
from typing import Any


SUPPORTED_TYPES = {
    "TEXT",
    "TEXTAREA",
    "RICHTEXT",
    "IMAGE",
    "GALLERY",
    "GEO_POINT",
    "MAP_REGION",
    "DROPDOWN",
    "MULTI_SELECT",
    "TAGS",
    "VIDEO",
    "AUDIO",
    "DATE",
    "DATETIME",
    "TIME",
    "NUMBER",
    "BOOLEAN",
    "RELATION",
}


def _get_config_val(config: Any, key: str) -> Any:
    if isinstance(config, dict):
        return config.get(key)
    return getattr(config, key, None)


def validate_fields(fields: list[Any]) -> list[str]:
    errors: list[str] = []

    keys = [field.key for field in fields]

    duplicate_keys = [
        key for key, count in Counter(keys).items() if count > 1
    ]

    for key in duplicate_keys:
        errors.append(f"Duplicate field key: {key}")

    orders = sorted(field.order for field in fields)
    expected = list(range(len(fields)))

    if orders != expected:
        errors.append("Field order must be contiguous starting at 0.")

    for field in fields:
        field_type = getattr(field, "type", None) or getattr(field, "field_type", None)
        if hasattr(field_type, "value"):
            field_type = field_type.value

        if field_type not in SUPPORTED_TYPES:
            errors.append(f"Unsupported field type: {field_type}")

        config = getattr(field, "config", None) or {}

        if field_type in {"IMAGE", "GALLERY"}:
            require_alt_text = _get_config_val(config, "require_alt_text")
            if require_alt_text is not True:
                errors.append(f"{field.key}: alt text requirement is mandatory.")

        if field_type in {"DROPDOWN", "MULTI_SELECT"}:
            options = _get_config_val(config, "options")
            if not options:
                errors.append(f"{field.key}: options are required.")

        if field_type == "RELATION":
            rel_slug = _get_config_val(config, "relation_template_slug")
            if not rel_slug:
                errors.append(f"{field.key}: relation template is required.")

        if field_type == "NUMBER":
            min_val = _get_config_val(config, "min")
            max_val = _get_config_val(config, "max")
            if min_val is not None and max_val is not None and min_val > max_val:
                errors.append(f"{field.key}: minimum cannot exceed maximum.")

    return errors
