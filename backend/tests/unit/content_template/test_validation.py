import pytest

from app.modules.content_template.domain.errors import (
    TemplateValidationError,
)
from app.modules.content_template.domain.validation import (
    validate_config,
    validate_field_key,
    validate_slug,
)


def test_valid_slug():
    validate_slug("tourist-destination")


@pytest.mark.parametrize(
    "slug",
    [
        "Tourist-Destination",
        "tourist destination",
        "tourist_destination",
        "-tourist",
        "tourist-",
        "tourist--destination",
    ],
)
def test_invalid_slug(slug):
    with pytest.raises(TemplateValidationError):
        validate_slug(slug)


def test_valid_field_key():
    validate_field_key("destination_name")


@pytest.mark.parametrize(
    "key",
    [
        "Destination",
        "destination-name",
        "1destination",
        "destination name",
        "_destination",
    ],
)
def test_invalid_field_key(key):
    with pytest.raises(TemplateValidationError):
        validate_field_key(key)


def test_valid_number_config():
    validate_config(
        "NUMBER",
        {
            "min": 0,
            "max": 100,
            "step": 1,
        },
    )


def test_invalid_number_range():
    with pytest.raises(TemplateValidationError):
        validate_config(
            "NUMBER",
            {
                "min": 100,
                "max": 0,
            },
        )


def test_image_requires_alt_text():
    with pytest.raises(TemplateValidationError):
        validate_config(
            "IMAGE",
            {
                "requireAltText": False,
            },
        )


def test_duplicate_choice_values_rejected():
    with pytest.raises(TemplateValidationError):
        validate_config(
            "DROPDOWN",
            {
                "choices": [
                    {
                        "value": "waterfall",
                        "label": "Waterfall",
                    },
                    {
                        "value": "waterfall",
                        "label": "Another",
                    },
                ]
            },
        )


def test_valid_geo_bounds():
    validate_config(
        "MAP_REGION",
        {
            "bounds": {
                "north": 22.0,
                "south": 17.0,
                "east": 84.0,
                "west": 80.0,
            },
            "allowMultiplePolygons": True,
        },
    )


def test_invalid_geo_bounds():
    with pytest.raises(TemplateValidationError):
        validate_config(
            "MAP_REGION",
            {
                "bounds": {
                    "north": 10,
                    "south": 20,
                    "east": 84,
                    "west": 80,
                },
                "allowMultiplePolygons": False,
            },
        )


def test_invalid_field_type():
    with pytest.raises(TemplateValidationError):
        validate_config(
            "INVALID_TYPE",
            {},
        )
