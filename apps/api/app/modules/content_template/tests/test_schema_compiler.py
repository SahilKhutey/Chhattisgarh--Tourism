from types import SimpleNamespace

from app.modules.content_template.services.schema_compiler import (
    compile_field,
    compile_template,
)


def test_compile_image_field_enforces_alt_text():
    field = SimpleNamespace(
        key="hero",
        label="Hero Image",
        field_type="IMAGE",
        required=True,
        translatable=False,
        order=0,
        group_name="media",
        help_text=None,
        config={},
    )

    result = compile_field(field)

    assert result["type"] == "IMAGE"
    assert result["config"]["requireAltText"] is True


def test_compile_geo_field_has_bounds():
    field = SimpleNamespace(
        key="location",
        label="Location",
        field_type="GEO_POINT",
        required=True,
        translatable=False,
        order=0,
        group_name=None,
        help_text=None,
        config={},
    )

    result = compile_field(field)

    assert "bounds" in result["config"]


def test_compile_template():
    template = SimpleNamespace(
        id="template-id",
        name="Tourist Place",
        slug="tourist-place",
        description=None,
        icon=None,
        category="destination",
        status="DRAFT",
        fields=[
            SimpleNamespace(
                key="name",
                label="Name",
                field_type="TEXT",
                required=True,
                translatable=True,
                order=0,
                group_name=None,
                help_text=None,
                config={},
            )
        ],
    )

    result = compile_template(template)

    assert result["template"]["slug"] == "tourist-place"
    assert len(result["fields"]) == 1
    assert result["fields"][0]["key"] == "name"
