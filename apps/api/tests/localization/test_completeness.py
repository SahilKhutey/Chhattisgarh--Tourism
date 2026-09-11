from types import SimpleNamespace

from app.modules.localization.completeness import calculate_completeness


def test_complete_translation():
    fields = [
        SimpleNamespace(key="name", translatable=True),
        SimpleNamespace(key="description", translatable=True),
    ]

    translations = [
        SimpleNamespace(field_key="name", locale_code="hi", value="नाम"),
        SimpleNamespace(field_key="description", locale_code="hi", value="विवरण"),
    ]

    result = calculate_completeness(fields, translations, "hi")

    assert result["complete"] is True
    assert result["percentage"] == 100.0
    assert result["translated_fields"] == 2
    assert result["total_fields"] == 2


def test_incomplete_translation():
    fields = [
        SimpleNamespace(key="name", translatable=True),
        SimpleNamespace(key="description", translatable=True),
    ]

    translations = [
        SimpleNamespace(field_key="name", locale_code="hi", value="नाम"),
    ]

    result = calculate_completeness(fields, translations, "hi")

    assert result["complete"] is False
    assert result["percentage"] == 50.0
    assert result["translated_fields"] == 1
    assert result["total_fields"] == 2


def test_non_translatable_fields_are_ignored():
    fields = [
        SimpleNamespace(key="name", translatable=True),
        SimpleNamespace(key="location", translatable=False),
    ]

    translations = [
        SimpleNamespace(field_key="name", locale_code="hi", value="नाम"),
    ]

    result = calculate_completeness(fields, translations, "hi")

    assert result["complete"] is True
    assert result["percentage"] == 100.0


def test_empty_translatable_fields():
    fields = [
        SimpleNamespace(key="lat", translatable=False),
        SimpleNamespace(key="lng", translatable=False),
    ]
    translations = []
    result = calculate_completeness(fields, translations, "hi")
    assert result["complete"] is True
    assert result["percentage"] == 100.0
