from __future__ import annotations


def resolve_translation(
    translations: dict[str, str],
    requested_locale: str,
    default_locale: str = "en",
) -> str | None:
    value = translations.get(requested_locale)

    if value and value.strip():
        return value

    fallback = translations.get(default_locale)

    if fallback and fallback.strip():
        return fallback

    return None
