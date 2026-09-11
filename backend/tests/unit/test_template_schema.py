import pytest
from pydantic import ValidationError

from app.modules.content_template.schemas import (
    TemplateMetadataInput,
)


def test_valid_template_metadata():
    data = TemplateMetadataInput(
        name="Tourist Destination",
        slug="tourist-destination",
    )

    assert data.name == "Tourist Destination"
    assert data.slug == "tourist-destination"


@pytest.mark.parametrize(
    "slug",
    [
        "Tourist-Destination",
        "tourist destination",
        "tourist_destination",
        "tourist--destination",
        "-tourist",
        "tourist-",
    ],
)
def test_invalid_slug(slug):
    with pytest.raises(ValidationError):
        TemplateMetadataInput(
            name="Tourist Destination",
            slug=slug,
        )
