from app.modules.localization.resolver import resolve_translation


def test_requested_locale_wins():
    result = resolve_translation(
        {
            "en": "Waterfall",
            "hi": "जलप्रपात",
        },
        "hi",
    )
    assert result == "जलप्रपात"


def test_default_locale_fallback():
    result = resolve_translation(
        {
            "en": "Waterfall",
        },
        "hi",
    )
    assert result == "Waterfall"


def test_missing_translation_returns_none():
    result = resolve_translation(
        {},
        "hi",
    )
    assert result is None


def test_whitespace_only_falls_back():
    result = resolve_translation(
        {
            "en": "Bastar Palace",
            "chg": "   ",
        },
        "chg",
    )
    assert result == "Bastar Palace"
