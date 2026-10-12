from __future__ import annotations

from app.modules.social.domain.enums import (
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialVisibility,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent


class SocialPublicationPolicy:
    """
    Publishing eligibility and public feed gatekeeper policies.
    Sections 9.32 & 9.34.
    """

    @staticmethod
    def source_available(content: SocialContent) -> bool:
        """Verifies original platform source is not deleted or unavailable."""
        unavailable_states = {
            SocialContentStatus.SOURCE_DELETED,
            SocialContentStatus.SOURCE_UNAVAILABLE,
            SocialContentStatus.SOURCE_PRIVATE,
        }
        if content.status in unavailable_states:
            return False

        source_url = getattr(content, "source_url", "")
        if not source_url or source_url == "SOURCE_UNAVAILABLE":
            return False

        return True

    @staticmethod
    def creator_active(creator: Creator | None) -> bool:
        """Verifies creator is active or verified."""
        if creator is None:
            return True  # Fallback if creator reference is detached
        return creator.status in {CreatorStatus.ACTIVE, CreatorStatus.VERIFIED}

    @staticmethod
    def account_active(account: SocialAccount | None) -> bool:
        """Verifies social account is active."""
        if account is None:
            return True  # Fallback if account reference is detached
        return account.status == SocialAccountStatus.ACTIVE

    @classmethod
    def is_publishable(
        cls,
        content: SocialContent,
        creator: Creator | None = None,
        account: SocialAccount | None = None,
    ) -> bool:
        """
        Publishing Eligibility Gate (Section 9.32):
        Content must be APPROVED, PUBLIC, source available, creator active, account active.
        """
        if content.status != SocialContentStatus.APPROVED:
            return False

        visibility = getattr(content, "visibility", SocialVisibility.PUBLIC)
        if visibility != SocialVisibility.PUBLIC:
            return False

        if not cls.source_available(content):
            return False

        if not cls.creator_active(creator):
            return False

        if not cls.account_active(account):
            return False

        return True

    @classmethod
    def is_feed_eligible(
        cls,
        content: SocialContent,
        creator: Creator | None = None,
        account: SocialAccount | None = None,
    ) -> bool:
        """
        Feed Eligibility Gate (Section 9.34):
        Published AND public AND creator active AND account active AND source available AND not hidden.
        """
        if content.status != SocialContentStatus.PUBLISHED:
            return False

        visibility = getattr(content, "visibility", SocialVisibility.PUBLIC)
        if visibility != SocialVisibility.PUBLIC:
            return False

        if not cls.source_available(content):
            return False

        if not cls.creator_active(creator):
            return False

        if not cls.account_active(account):
            return False

        return True


__all__ = ["SocialPublicationPolicy"]
