from __future__ import annotations

import re
from urllib.parse import urlparse

_DURATION_RE = re.compile(
    r"^PT"
    r"(?:(?P<hours>\d+)H)?"
    r"(?:(?P<minutes>\d+)M)?"
    r"(?:(?P<seconds>\d+)S)?$"
)


def clean_handle(handle: str) -> str:
    """Strips whitespace and leading @ from a handle."""
    return handle.strip().lstrip("@")


def parse_youtube_profile(url_or_handle: str) -> tuple[str, str]:
    """
    Parses a YouTube URL, handle, or channel ID.
    Returns a tuple of (kind, value), where kind is 'handle', 'channel_id', 'custom', or 'user'.
    """
    val = url_or_handle.strip()
    if not val:
        raise ValueError("YouTube identifier cannot be empty.")

    # Direct handle e.g. @RaviBastar
    if val.startswith("@"):
        return "handle", val[1:]

    # Direct Channel ID e.g. UCxxxxxxxxxxxxxxxxxxxx
    if val.startswith("UC") and len(val) >= 20 and "/" not in val:
        return "channel_id", val

    # Parse as URL if it looks like a URL
    if "youtube.com" in val or "youtu.be" in val or val.startswith("http://") or val.startswith("https://"):
        parsed = urlparse(val if "://" in val else f"https://{val}")
        path = parsed.path.strip("/")
        if not path:
            raise ValueError(f"Unsupported YouTube channel URL: {url_or_handle}")

        if path.startswith("@"):
            return "handle", path[1:]
        if path.startswith("channel/"):
            return "channel_id", path.split("/", 1)[1]
        if path.startswith("c/"):
            return "custom", path.split("/", 1)[1]
        if path.startswith("user/"):
            return "user", path.split("/", 1)[1]

        # Plain path e.g. youtube.com/RaviBastar
        parts = path.split("/")
        first_part = parts[0]
        if first_part.startswith("@"):
            return "handle", first_part[1:]
        if first_part.startswith("UC") and len(first_part) >= 20:
            return "channel_id", first_part
        return "handle", first_part

    # Plain string without @, treat as handle
    return "handle", val


def duration_to_seconds(value: str) -> int:
    """
    Parses an ISO 8601 duration string (e.g. PT15M33S, PT1H2M10S, PT30S) into total seconds.
    """
    if not value or value == "PT0S" or value == "P0D":
        return 0

    match = _DURATION_RE.match(value.strip())
    if not match:
        raise ValueError(f"Unsupported YouTube duration: {value}")

    hours = int(match.group("hours") or 0)
    minutes = int(match.group("minutes") or 0)
    seconds = int(match.group("seconds") or 0)
    return hours * 3600 + minutes * 60 + seconds


def youtube_video_url(video_id: str) -> str:
    """Returns canonical YouTube video watch URL."""
    return f"https://www.youtube.com/watch?v={video_id}"


def youtube_channel_url(channel_id: str) -> str:
    """Returns canonical YouTube channel URL."""
    return f"https://www.youtube.com/channel/{channel_id}"


__all__ = [
    "clean_handle",
    "parse_youtube_profile",
    "duration_to_seconds",
    "youtube_video_url",
    "youtube_channel_url",
]
