from __future__ import annotations

from typing import Any

SUPPORTED_LOCALES = {
    "en",
    "hi",
    "chg",
}


def resolve_localized_value(
    value: Any,
    locale: str,
    default_locale: str = "en",
) -> Any:
    """Resolves a field value that may be stored as a localized dictionary {locale: value}."""
    if not isinstance(value, dict):
        return value

    localized_keys = set(value.keys())

    if not (localized_keys & SUPPORTED_LOCALES):
        return value

    requested = value.get(locale)
    if requested is not None and requested != "":
        return requested

    fallback = value.get(default_locale)
    if fallback is not None:
        return fallback

    return None


def resolve_entry_field(
    field_key: str,
    entry_values: dict[str, Any] | None,
    entry_locale_values: dict[str, dict[str, Any]] | None,
    locale: str,
    default_locale: str = "en",
) -> tuple[Any, bool]:
    """
    Authoritative field value resolution across entry values and locale_values.
    Returns (resolved_value, fallback_used).
    """
    locale_dict = (entry_locale_values or {}).get(locale, {})
    if field_key in locale_dict and locale_dict[field_key] is not None:
        return locale_dict[field_key], False

    base_raw = (entry_values or {}).get(field_key)
    if isinstance(base_raw, dict) and (set(base_raw.keys()) & SUPPORTED_LOCALES):
        val = resolve_localized_value(base_raw, locale, default_locale)
        fallback = val is not None and locale != default_locale and locale not in base_raw
        return val, fallback

    if locale == default_locale:
        return base_raw, False

    # Try default locale fallback in locale_values
    default_dict = (entry_locale_values or {}).get(default_locale, {})
    if field_key in default_dict and default_dict[field_key] is not None:
        return default_dict[field_key], True

    # Fallback to base value
    if base_raw is not None:
        return base_raw, True

    return None, False
