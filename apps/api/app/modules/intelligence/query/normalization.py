from __future__ import annotations

import re
import unicodedata


def normalize_query(query: str) -> str:
    """Normalizes query using unicode NFKC, lowercasing, and whitespace collapse."""
    if not query:
        return ""
    norm = unicodedata.normalize("NFKC", query)
    norm = norm.lower().strip()
    return re.sub(r"\s+", " ", norm)
