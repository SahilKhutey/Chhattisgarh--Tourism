from __future__ import annotations

import re
from dataclasses import dataclass

from .tokenizer import normalize_query


@dataclass
class ParsedQuery:
    text: str
    location: str | None = None
    category: str | None = None


KNOWN_LOCATION_PATTERNS = [
    re.compile(r"^(?P<text>.+?)\s+near\s+(?P<location>.+)$", re.IGNORECASE),
    re.compile(r"^(?P<text>.+?)\s+in\s+(?P<location>.+)$", re.IGNORECASE),
    re.compile(r"^(?P<text>.+?)\s+around\s+(?P<location>.+)$", re.IGNORECASE),
    re.compile(r"^around\s+(?P<location>.+)$", re.IGNORECASE),
    re.compile(r"^near\s+(?P<location>.+)$", re.IGNORECASE),
]


def parse_query(query: str | None) -> ParsedQuery:
    """Parses a search query string to extract search text, location, or intent."""
    normalized = normalize_query(query)
    if not normalized:
        return ParsedQuery(text="", location=None)

    for pattern in KNOWN_LOCATION_PATTERNS:
        match = pattern.match(normalized)
        if match:
            group_dict = match.groupdict()
            text = (group_dict.get("text") or "").strip()
            location = (group_dict.get("location") or "").strip()
            return ParsedQuery(
                text=text,
                location=location or None,
            )

    return ParsedQuery(text=normalized, location=None)
