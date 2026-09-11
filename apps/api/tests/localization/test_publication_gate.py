import pytest

from app.modules.localization.publication_gate import (
    LocalizationPublicationError,
    enforce_localization_gate,
)


def test_enforce_localization_gate_passes_when_all_required_locales_complete():
    # When required locales are 100% complete
    enforce_localization_gate(
        default_locale="en",
        translated_locales={"en": 100.0, "hi": 100.0},
        required_locales={"en", "hi"},
    )


def test_enforce_localization_gate_raises_when_required_locale_incomplete():
    with pytest.raises(LocalizationPublicationError) as exc_info:
        enforce_localization_gate(
            default_locale="en",
            translated_locales={"en": 100.0, "hi": 50.0},
            required_locales={"en", "hi"},
        )
    assert "Required locales are incomplete: hi" in str(exc_info.value)


def test_enforce_localization_gate_ignores_optional_locales():
    # Only "en" is required, "chg" is optional and 0% complete
    enforce_localization_gate(
        default_locale="en",
        translated_locales={"en": 100.0, "chg": 0.0},
        required_locales={"en"},
    )
