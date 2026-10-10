from __future__ import annotations

import re
from typing import Any

from app.modules.social.domain.enums import ContentType, SocialContentType

_SHORTS_REGEX = re.compile(r"(?:#shorts?\b|/shorts/)", re.IGNORECASE)


class YouTubeContentClassifier:
    """Classifies YouTube content into canonical SocialContentType (SHORT vs VIDEO)."""

    def __init__(self, max_short_duration_seconds: int = 180) -> None:
        self.max_short_duration_seconds = max_short_duration_seconds

    def is_short_candidate(
        self,
        *,
        duration_seconds: int,
        title: str | None = None,
        description: str | None = None,
        source_url: str | None = None,
        tags: list[str] | None = None,
    ) -> bool:
        """Evaluates multiple signals to determine if video is a YouTube Short."""
        # 1. Negative gate: Videos over max_short_duration_seconds are never shorts
        if duration_seconds > self.max_short_duration_seconds:
            return False

        # 2. Strong signal: Title, description, or URL explicitly contains #short or /shorts/
        text_corpus = f"{title or ''} {description or ''} {source_url or ''}"
        if _SHORTS_REGEX.search(text_corpus):
            return True

        # 3. Tags contain short
        if tags:
            for t in tags:
                if t.lower() in ("shorts", "short", "ytshorts"):
                    return True

        # 4. Under max duration (YouTube shorts default threshold <= 180s)
        if 0 < duration_seconds <= self.max_short_duration_seconds:
            return True

        return False

    def classify(
        self,
        *,
        duration_seconds: int,
        title: str | None = None,
        description: str | None = None,
        source_url: str | None = None,
        tags: list[str] | None = None,
    ) -> SocialContentType:
        """Returns SocialContentType.SHORT or SocialContentType.VIDEO."""
        if self.is_short_candidate(
            duration_seconds=duration_seconds,
            title=title,
            description=description,
            source_url=source_url,
            tags=tags,
        ):
            return SocialContentType.SHORT
        return SocialContentType.VIDEO

    def classify_domain(
        self,
        *,
        duration_seconds: int,
        title: str | None = None,
        description: str | None = None,
        source_url: str | None = None,
        tags: list[str] | None = None,
    ) -> ContentType:
        """Returns domain ContentType.SHORT or ContentType.VIDEO."""
        ct = self.classify(
            duration_seconds=duration_seconds,
            title=title,
            description=description,
            source_url=source_url,
            tags=tags,
        )
        return ContentType.SHORT if ct == SocialContentType.SHORT else ContentType.VIDEO


__all__ = ["YouTubeContentClassifier"]
