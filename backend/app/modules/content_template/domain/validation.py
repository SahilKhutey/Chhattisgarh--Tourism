import re
from typing import Any

from .errors import TemplateValidationError

FIELD_TYPES = {
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

KEY_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def validate_slug(slug: str) -> None:
    if not SLUG_PATTERN.fullmatch(slug):
        raise TemplateValidationError(
            "Slug must contain lowercase letters, numbers and hyphens."
        )


def validate_field_key(key: str) -> None:
    if not KEY_PATTERN.fullmatch(key):
        raise TemplateValidationError(
            "Field key must contain lowercase letters, numbers and underscores and start with a letter."
        )


def validate_field_type(field_type: str) -> None:
    if field_type not in FIELD_TYPES:
        raise TemplateValidationError(f"Unsupported field type: {field_type}")


def validate_config(
    field_type: str,
    config: dict[str, Any],
) -> None:
    validate_field_type(field_type)

    if "maxLength" in config:
        if not isinstance(config["maxLength"], int):
            raise TemplateValidationError("maxLength must be an integer.")
        if config["maxLength"] < 1:
            raise TemplateValidationError("maxLength must be greater than zero.")

    if "minLength" in config:
        if not isinstance(config["minLength"], int):
            raise TemplateValidationError("minLength must be an integer.")

    if (
        "minLength" in config
        and "maxLength" in config
        and config["minLength"] > config["maxLength"]
    ):
        raise TemplateValidationError("minLength cannot exceed maxLength.")

    if field_type == "NUMBER":
        validate_number_config(config)

    if field_type in {"DROPDOWN", "MULTI_SELECT"}:
        validate_choice_config(config)

    if field_type == "IMAGE":
        validate_image_config(config)

    if field_type == "GALLERY":
        validate_gallery_config(config)

    if field_type == "GEO_POINT":
        validate_geo_config(config)

    if field_type == "MAP_REGION":
        validate_map_region_config(config)

    if field_type == "RELATION":
        validate_relation_config(config)


def validate_number_config(config: dict[str, Any]) -> None:
    for key in ("min", "max", "step"):
        if key in config and not isinstance(config[key], (int, float)):
            raise TemplateValidationError(f"{key} must be numeric.")

    if "min" in config and "max" in config and config["min"] > config["max"]:
        raise TemplateValidationError("Number min cannot exceed max.")

    if "step" in config and config["step"] <= 0:
        raise TemplateValidationError("Number step must be greater than zero.")


def validate_choice_config(config: dict[str, Any]) -> None:
    choices = config.get("choices")

    if not isinstance(choices, list):
        raise TemplateValidationError("choices must be an array.")

    values = set()

    for choice in choices:
        if not isinstance(choice, dict):
            raise TemplateValidationError("Each choice must be an object.")

        value = choice.get("value")
        label = choice.get("label")

        if not value or not label:
            raise TemplateValidationError("Choice requires value and label.")

        if value in values:
            raise TemplateValidationError(f"Duplicate choice value: {value}")

        values.add(value)


def validate_image_config(config: dict[str, Any]) -> None:
    if config.get("requireAltText") is not True:
        raise TemplateValidationError("Image fields must require alt text.")


def validate_gallery_config(config: dict[str, Any]) -> None:
    if config.get("requireAltText") is not True:
        raise TemplateValidationError("Gallery fields must require alt text.")


def validate_geo_config(config: dict[str, Any]) -> None:
    bounds = config.get("bounds")
    if bounds is None:
        return
    validate_bounds(bounds)


def validate_map_region_config(config: dict[str, Any]) -> None:
    bounds = config.get("bounds")
    if bounds is not None:
        validate_bounds(bounds)

    if not isinstance(config.get("allowMultiplePolygons"), bool):
        raise TemplateValidationError("allowMultiplePolygons must be boolean.")


def validate_bounds(bounds: dict[str, Any]) -> None:
    required = {"north", "south", "east", "west"}

    if not required.issubset(bounds):
        raise TemplateValidationError("Geo bounds require north, south, east and west.")

    north = bounds["north"]
    south = bounds["south"]
    east = bounds["east"]
    west = bounds["west"]

    if not -90 <= south <= 90:
        raise TemplateValidationError("Invalid south latitude.")

    if not -90 <= north <= 90:
        raise TemplateValidationError("Invalid north latitude.")

    if not -180 <= west <= 180:
        raise TemplateValidationError("Invalid west longitude.")

    if not -180 <= east <= 180:
        raise TemplateValidationError("Invalid east longitude.")

    if north <= south:
        raise TemplateValidationError("North must be greater than south.")

    if east <= west:
        raise TemplateValidationError("East must be greater than west.")


def validate_relation_config(config: dict[str, Any]) -> None:
    target = config.get("targetTemplateSlug")

    if not isinstance(target, str) or not target:
        raise TemplateValidationError("Relation requires targetTemplateSlug.")

    validate_slug(target)

    if not isinstance(config.get("allowMultiple"), bool):
        raise TemplateValidationError("Relation allowMultiple must be boolean.")
