import re

from app.modules.content_template.domain.constants import (
    ALT_TEXT_REQUIRED_TYPES,
    DEFAULT_GEO_BOUNDS,
    FIELD_KEY_PATTERN,
)
from app.modules.content_template.domain.enums import (
    TemplateFieldType,
)
from app.modules.content_template.domain.exceptions import (
    TemplateValidationError,
)


def validate_field_key(key: str) -> None:
    if not re.fullmatch(FIELD_KEY_PATTERN, key):
        raise TemplateValidationError(
            f"Invalid field key: {key}"
        )


def validate_unique_field_keys(fields) -> None:
    keys = [field.key for field in fields]

    if len(keys) != len(set(keys)):
        raise TemplateValidationError(
            "Template field keys must be unique."
        )


def validate_field_order(fields) -> None:
    orders = sorted(
        field.order
        for field in fields
    )

    expected = list(
        range(len(fields))
    )

    if orders != expected:
        raise TemplateValidationError(
            "Field order must be contiguous starting at 0."
        )


def validate_media_accessibility(fields) -> None:
    for field in fields:
        field_type = getattr(field.field_type, "value", field.field_type)

        if field_type in ALT_TEXT_REQUIRED_TYPES:
            config = getattr(field, "config", {}) or {}
            require_alt_text = config.get(
                "requireAltText",
                True,
            )

            if require_alt_text is not True:
                raise TemplateValidationError(
                    f"{field_type} requires alt text."
                )


def validate_geo_config(fields) -> None:
    for field in fields:
        field_type = getattr(field.field_type, "value", field.field_type)
        if field_type not in {
            TemplateFieldType.GEO_POINT.value,
            TemplateFieldType.MAP_REGION.value,
        }:
            continue

        config = getattr(field, "config", {}) or {}
        bounds = config.get(
            "bounds",
            DEFAULT_GEO_BOUNDS,
        )

        min_lat = bounds["min_lat"]
        max_lat = bounds["max_lat"]
        min_lng = bounds["min_lng"]
        max_lng = bounds["max_lng"]

        if not (
            -90 <= min_lat <= 90
            and -90 <= max_lat <= 90
            and -180 <= min_lng <= 180
            and -180 <= max_lng <= 180
        ):
            raise TemplateValidationError(
                f"Invalid geographic bounds for {field.key}."
            )

        if min_lat >= max_lat:
            raise TemplateValidationError(
                f"Invalid latitude range for {field.key}."
            )

        if min_lng >= max_lng:
            raise TemplateValidationError(
                f"Invalid longitude range for {field.key}."
            )


def validate_template_fields(fields) -> None:
    for field in fields:
        validate_field_key(field.key)

    validate_unique_field_keys(fields)
    validate_field_order(fields)
    validate_media_accessibility(fields)
    validate_geo_config(fields)
