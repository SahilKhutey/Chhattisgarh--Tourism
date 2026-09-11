from types import SimpleNamespace

import pytest

from app.modules.content_template.domain.enums import (
    TemplateFieldType,
)
from app.modules.content_template.domain.exceptions import (
    TemplateValidationError,
)
from app.modules.content_template.validators.template_validator import (
    validate_template_fields,
)


def field(
    key,
    field_type="TEXT",
    order=0,
    config=None,
):
    return SimpleNamespace(
        key=key,
        field_type=field_type,
        order=order,
        config=config or {},
    )


def test_valid_template_fields():
    fields = [
        field("name", order=0),
        field("description", "TEXTAREA", order=1),
    ]

    validate_template_fields(fields)


def test_invalid_field_key():
    fields = [
        field("Invalid Key"),
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


def test_duplicate_keys():
    fields = [
        field("name", order=0),
        field("name", order=1),
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


def test_invalid_order():
    fields = [
        field("name", order=0),
        field("description", order=2),
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


def test_image_requires_alt_text():
    fields = [
        field(
            "hero_image",
            "IMAGE",
            config={
                "requireAltText": False,
            },
        )
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


def test_gallery_requires_alt_text():
    fields = [
        field(
            "photo_gallery",
            "GALLERY",
            config={
                "requireAltText": False,
            },
        )
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


def test_geo_bounds():
    fields = [
        field(
            "location",
            "GEO_POINT",
            config={
                "bounds": {
                    "min_lat": 17.5,
                    "max_lat": 24.5,
                    "min_lng": 80.0,
                    "max_lng": 84.5,
                }
            },
        )
    ]

    validate_template_fields(fields)


def test_invalid_lat_range():
    fields = [
        field(
            "location",
            "GEO_POINT",
            config={
                "bounds": {
                    "min_lat": 25.0,
                    "max_lat": 20.0,
                    "min_lng": 80.0,
                    "max_lng": 84.5,
                }
            },
        )
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


def test_invalid_lng_range():
    fields = [
        field(
            "location",
            "MAP_REGION",
            config={
                "bounds": {
                    "min_lat": 17.5,
                    "max_lat": 24.5,
                    "min_lng": 85.0,
                    "max_lng": 80.0,
                }
            },
        )
    ]

    with pytest.raises(TemplateValidationError):
        validate_template_fields(fields)


@pytest.mark.parametrize(
    "field_type",
    list(TemplateFieldType),
)
def test_all_field_types_are_supported(field_type):
    assert field_type.value in {
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
