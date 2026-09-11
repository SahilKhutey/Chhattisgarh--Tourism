FIELD_KEY_PATTERN = r"^[a-z][a-z0-9_]{1,63}$"

SUPPORTED_LOCALES = (
    "en",
    "hi",
    "chg",
)

DEFAULT_LOCALE = "en"

DEFAULT_GEO_BOUNDS = {
    "min_lat": 17.5,
    "max_lat": 24.5,
    "min_lng": 80.0,
    "max_lng": 84.5,
}

ALT_TEXT_REQUIRED_TYPES = {
    "IMAGE",
    "GALLERY",
}
