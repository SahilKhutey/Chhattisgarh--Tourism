import pytest
from app.modules.content_entries.domain.types import EntryValidationError
from app.modules.content_entries.services.entry_validator import ContentEntryValidator


@pytest.fixture
def validator():
    return ContentEntryValidator()


def test_unknown_field_rejected(validator, destination_template):
    _, version = destination_template
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Barnawapara", "unknown_field": "intruder"},
        )
    assert "unknown_field: unknown field not defined" in str(exc.value)


def test_missing_required_field_rejected(validator, destination_template):
    _, version = destination_template
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={},  # name is required
        )
    assert "name: value is required" in str(exc.value)


def test_valid_entry_values_accepted(validator, destination_template):
    _, version = destination_template
    # Should not raise
    validator.validate(
        version,
        values={
            "name": "Barnawapara Wildlife Sanctuary",
            "description": "Dense forest and diverse wildlife.",
            "entry_fee": 50,
            "is_active": True,
            "category": "wildlife",
            "tags": ["ecotourism", "safari"],
            "location": {"latitude": 21.4, "longitude": 82.4},
            "cover_image": {"url": "https://example.com/barna.jpg", "alt": "Forest view"},
        },
    )


def test_number_validation_bounds(validator, destination_template):
    _, version = destination_template
    # Below min (min=0)
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Test", "entry_fee": -10},
        )
    assert "entry_fee: below minimum" in str(exc.value)

    # Above max (max=10000)
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Test", "entry_fee": 99999},
        )
    assert "entry_fee: above maximum" in str(exc.value)


def test_dropdown_validation(validator, destination_template):
    _, version = destination_template
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Test", "category": "invalid_option"},
        )
    assert "category: invalid option" in str(exc.value)


def test_geo_point_range_and_bounds(validator, destination_template):
    _, version = destination_template
    # Out of world range
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Test", "location": {"latitude": 999, "longitude": 82.0}},
        )
    assert "latitude out of range" in str(exc.value)

    # Outside configured Chhattisgarh bounds (17-25 lat, 79-85 lng)
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Test", "location": {"latitude": 28.6, "longitude": 77.2}},  # Delhi
        )
    assert "latitude outside configured geography" in str(exc.value)


def test_image_accessibility_alt_text_required(validator, destination_template):
    _, version = destination_template
    # Empty alt text
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={
                "name": "Test",
                "cover_image": {"url": "https://example.com/pic.jpg", "alt": "   "},
            },
        )
    assert "cover_image: alt text is required" in str(exc.value)


def test_locale_validation(validator, destination_template):
    _, version = destination_template
    # Unsupported locale
    with pytest.raises(EntryValidationError) as exc:
        validator.validate(
            version,
            values={"name": "Test"},
            locale_values={"fr": {"name": "Test FR"}},
        )
    assert "unsupported locale fr" in str(exc.value)

    # Valid multilingual entry
    validator.validate(
        version,
        values={"name": "Barnawapara"},
        locale_values={
            "hi": {"name": "बरनवापारा"},
            "chg": {"name": "बरनवापारा अभयारण्य"},
        },
    )
