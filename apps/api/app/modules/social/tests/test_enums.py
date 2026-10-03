from __future__ import annotations

from app.modules.social.domain.enums import (
    AccountAcceptanceAction,
    SocialAccountStatus,
    SocialContentStatus,
    SocialContentType,
    SocialModerationStatus,
    SocialPlatform,
    SocialVisibility,
    SyncStatus,
)


def test_social_platform_enum_values() -> None:
    assert SocialPlatform.YOUTUBE == "youtube"
    assert SocialPlatform.INSTAGRAM == "instagram"
    # Case insensitivity lookup test
    assert SocialPlatform("YOUTUBE") == SocialPlatform.YOUTUBE
    assert SocialPlatform("instagram") == SocialPlatform.INSTAGRAM


def test_social_account_status_values() -> None:
    assert SocialAccountStatus.PENDING == "pending"
    assert SocialAccountStatus.VERIFYING == "verifying"
    assert SocialAccountStatus.VERIFIED == "verified"
    assert SocialAccountStatus.ACCEPTED == "accepted"
    assert SocialAccountStatus.ACTIVE == "active"
    assert SocialAccountStatus.PAUSED == "paused"
    assert SocialAccountStatus.REJECTED == "rejected"
    assert SocialAccountStatus.DISCONNECTED == "disconnected"


def test_social_content_type_values() -> None:
    assert SocialContentType.POST == "post"
    assert SocialContentType.VIDEO == "video"
    assert SocialContentType.REEL == "reel"
    assert SocialContentType.SHORT == "short"
    assert SocialContentType.STORY == "story"


def test_social_content_status_values() -> None:
    assert SocialContentStatus.DISCOVERED == "discovered"
    assert SocialContentStatus.SYNCED == "synced"
    assert SocialContentStatus.VALIDATED == "validated"
    assert SocialContentStatus.UNDER_REVIEW == "under_review"
    assert SocialContentStatus.APPROVED == "approved"
    assert SocialContentStatus.PUBLISHED == "published"
    assert SocialContentStatus.HIDDEN == "hidden"
    assert SocialContentStatus.REMOVED == "removed"
    assert SocialContentStatus.SOURCE_UNAVAILABLE == "source_unavailable"
    assert SocialContentStatus.SOURCE_DELETED == "source_deleted"
    assert SocialContentStatus.SOURCE_PRIVATE == "source_private"


def test_social_moderation_status_values() -> None:
    assert SocialModerationStatus.NOT_REQUIRED == "not_required"
    assert SocialModerationStatus.PENDING == "pending"
    assert SocialModerationStatus.APPROVED == "approved"
    assert SocialModerationStatus.REJECTED == "rejected"


def test_social_visibility_and_sync_status() -> None:
    assert SocialVisibility.PUBLIC == "public"
    assert SocialVisibility.HIDDEN == "hidden"

    assert SyncStatus.NEVER_RUN == "never_run"
    assert SyncStatus.RUNNING == "running"
    assert SyncStatus.SUCCEEDED == "succeeded"
    assert SyncStatus.PARTIAL == "partial"
    assert SyncStatus.FAILED == "failed"

    assert AccountAcceptanceAction.ACCEPT == "accept"
    assert AccountAcceptanceAction.REJECT == "reject"
    assert AccountAcceptanceAction.PAUSE == "pause"
    assert AccountAcceptanceAction.REACTIVATE == "reactivate"
