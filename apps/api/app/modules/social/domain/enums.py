from __future__ import annotations

from enum import StrEnum


class SocialPlatform(StrEnum):
    YOUTUBE = "youtube"
    INSTAGRAM = "instagram"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            for member in cls:
                if member.value.lower() == value.lower() or member.name.lower() == value.lower():
                    return member
        return None


class SocialAccountStatus(StrEnum):
    PENDING = "pending"
    VERIFYING = "verifying"
    VERIFIED = "verified"
    PENDING_ACCEPTANCE = "pending_acceptance"
    ACCEPTED = "accepted"
    ACTIVE = "active"
    PAUSED = "paused"
    REJECTED = "rejected"
    DISCONNECTED = "disconnected"

    @classmethod
    def _missing_(cls, value: object):
        if isinstance(value, str):
            for member in cls:
                if member.value.lower() == value.lower() or member.name.lower() == value.lower():
                    return member
        return None


class SocialContentType(StrEnum):
    POST = "post"
    VIDEO = "video"
    REEL = "reel"
    SHORT = "short"
    STORY = "story"


class SocialContentStatus(StrEnum):
    DISCOVERED = "discovered"
    SYNCED = "synced"
    VALIDATED = "validated"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    HIDDEN = "hidden"
    REMOVED = "removed"
    SOURCE_UNAVAILABLE = "source_unavailable"
    SOURCE_DELETED = "source_deleted"
    SOURCE_PRIVATE = "source_private"


class SocialModerationStatus(StrEnum):
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class SocialVisibility(StrEnum):
    PUBLIC = "public"
    HIDDEN = "hidden"


class SyncStatus(StrEnum):
    NEVER_RUN = "never_run"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    PARTIAL = "partial"
    FAILED = "failed"


class AccountAcceptanceAction(StrEnum):
    ACCEPT = "accept"
    REJECT = "reject"
    PAUSE = "pause"
    REACTIVATE = "reactivate"


# Existing domain enums retained for backwards compatibility
class ContentType(StrEnum):
    POST = "POST"
    VIDEO = "VIDEO"
    REEL = "REEL"
    SHORT = "SHORT"
    STORY = "STORY"
    JOURNAL = "JOURNAL"
    CULTURAL_STORY = "CULTURAL_STORY"


class SyncHealthStatus(StrEnum):
    HEALTHY = "HEALTHY"
    SYNCING = "SYNCING"
    ERROR = "ERROR"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    PAUSED = "PAUSED"


class FeedLayoutType(StrEnum):
    STANDARD_GRID = "STANDARD_GRID"
    MASONRY = "MASONRY"
    FEATURED_GRID = "FEATURED_GRID"
    REGIONAL_SHOWCASE = "REGIONAL_SHOWCASE"


class CreatorStatus(StrEnum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class ContentStatus(StrEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PROCESSING = "PROCESSING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    HIDDEN = "HIDDEN"
    ARCHIVED = "ARCHIVED"
    EXPIRED = "EXPIRED"


class ContentVisibility(StrEnum):
    PUBLIC = "PUBLIC"
    UNLISTED = "UNLISTED"
    PRIVATE = "PRIVATE"


class ModerationStatus(StrEnum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ESCALATED_CULTURAL_COMMITTEE = "ESCALATED_CULTURAL_COMMITTEE"


class ModerationDecision(StrEnum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    REQUEST_CHANGES = "REQUEST_CHANGES"
    ESCALATE = "ESCALATE"


class CulturalSensitivityLevel(StrEnum):
    STANDARD = "STANDARD"
    SENSITIVE = "SENSITIVE"
    SACRED_RITUAL = "SACRED_RITUAL"
    COMMUNITY_PROTECTED = "COMMUNITY_PROTECTED"


class LicenseType(StrEnum):
    ORIGINAL_CREATOR = "ORIGINAL_CREATOR"
    CC_BY_SA = "CC_BY_SA"
    COMMUNITY_HERITAGE = "COMMUNITY_HERITAGE"
    EDITORIAL_PERMITTED = "EDITORIAL_PERMITTED"


class FeedType(StrEnum):
    HOME = "HOME"
    EXPLORE = "EXPLORE"
    REGIONAL = "REGIONAL"
    CULTURE = "CULTURE"


class InteractionType(StrEnum):
    LIKE = "LIKE"
    COMMENT = "COMMENT"
    SAVE = "SAVE"
    SHARE = "SHARE"
    TRIP_ADD = "TRIP_ADD"
