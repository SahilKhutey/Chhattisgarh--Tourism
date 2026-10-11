from __future__ import annotations

import re
from urllib.parse import urlparse

_VALID_HANDLE_REGEX = re.compile(r"^[a-zA-Z0-9._]{1,30}$")


def parse_instagram_profile(url_or_handle: str) -> str:
    """
    Parses and normalizes an Instagram profile handle or URL.
    Returns normalized lowercase username without '@'.
    """
    cleaned = (url_or_handle or "").strip()
    if not cleaned:
        raise ValueError("Instagram profile input cannot be empty.")

    # Direct handle (e.g. @ravibastar or ravibastar)
    if "://" not in cleaned and "/" not in cleaned:
        handle = cleaned.lstrip("@").lower()
        if not handle:
            raise ValueError("Instagram username is missing.")
        if not _VALID_HANDLE_REGEX.match(handle):
            raise ValueError(f"Invalid Instagram handle format: '{handle}'.")
        return handle

    # URL parsing
    parsed = urlparse(cleaned)

    if parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError("Instagram URL must use HTTP or HTTPS.")

    netloc = parsed.netloc.lower()
    if netloc not in {"instagram.com", "www.instagram.com", "m.instagram.com"}:
        raise ValueError("URL is not an Instagram profile.")

    parts = [part for part in parsed.path.split("/") if part]
    if not parts:
        raise ValueError("Instagram username is missing.")

    username = parts[0]
    if username.startswith("@"):
        username = username[1:]

    username = username.strip().lower()
    if not username:
        raise ValueError("Instagram username is missing.")

    if not _VALID_HANDLE_REGEX.match(username):
        raise ValueError(f"Invalid Instagram username format: '{username}'.")

    return username


def instagram_profile_url(username: str) -> str:
    """Constructs canonical Instagram profile URL."""
    clean = parse_instagram_profile(username)
    return f"https://www.instagram.com/{clean}/"


def instagram_permalink(shortcode_or_id: str, is_reel: bool = False) -> str:
    """Constructs canonical post/reel permalink."""
    path = "reel" if is_reel else "p"
    return f"https://www.instagram.com/{path}/{shortcode_or_id.strip()}/"


__all__ = [
    "parse_instagram_profile",
    "instagram_profile_url",
    "instagram_permalink",
]
