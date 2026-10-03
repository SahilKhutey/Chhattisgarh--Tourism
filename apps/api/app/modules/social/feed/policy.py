from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from app.modules.social.domain.enums import (
    ContentStatus,
    ContentVisibility,
    ModerationStatus,
)
from app.modules.social.models.social_content import SocialContent


@dataclass(frozen=True, slots=True)
class FeedPolicy:
    require_published: bool = True
    require_approved: bool = True
    require_public: bool = True
    allow_expired_if_evergreen: bool = True


def is_feed_eligible(
    content: SocialContent,
    policy: FeedPolicy = FeedPolicy(),
    reference_time: datetime | None = None,
) -> bool:
    """Evaluates whether content meets publication, moderation, visibility, and expiration rules."""
    now = reference_time or datetime.now(timezone.utc)

    if policy.require_published and content.publication_status != ContentStatus.PUBLISHED.value:
        return False

    if policy.require_approved and content.moderation_status != ModerationStatus.APPROVED.value:
        return False

    if policy.require_public and content.visibility != ContentVisibility.PUBLIC.value:
        return False

    if content.expires_at and content.expires_at <= now:
        if not (policy.allow_expired_if_evergreen and content.is_evergreen):
            return False

    return True


__all__ = ["FeedPolicy", "is_feed_eligible"]
