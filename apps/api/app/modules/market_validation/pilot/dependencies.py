from __future__ import annotations

from fastapi import Header


def get_expected_version(if_match: str | None = Header(None, alias="If-Match")) -> int | None:
    """Extract expected version number from If-Match header (e.g. '"1"' or '1')."""
    if if_match is None:
        return None
    cleaned = if_match.strip().strip('"').strip("'")
    try:
        return int(cleaned)
    except ValueError:
        return None
