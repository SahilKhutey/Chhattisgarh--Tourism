from __future__ import annotations


class LocalizationPublicationError(Exception):
    pass


def enforce_localization_gate(
    *,
    default_locale: str,
    translated_locales: dict[str, float],
    required_locales: set[str],
) -> None:
    missing = [
        locale
        for locale in required_locales
        if translated_locales.get(locale, 0.0) < 100.0
    ]

    if missing:
        raise LocalizationPublicationError(
            "Required locales are incomplete: "
            + ", ".join(sorted(missing))
        )
