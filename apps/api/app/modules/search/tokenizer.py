from __future__ import annotations

import re
import unicodedata


def normalize_query(value: str | None) -> str:
    """Normalizes query text using unicode NFKC, stripping and whitespace collapsing."""
    if not value:
        return ""

    normalized = unicodedata.normalize("NFKC", value)
    cleaned = normalized.strip()
    return re.sub(r"\s+", " ", cleaned)
