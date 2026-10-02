from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.errors import AppError
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    CreatorStatus,
    CulturalSensitivityLevel,
    ModerationDecision,
    ModerationStatus,
)


class InvalidStateTransitionError(AppError):
    def __init__(self, entity: str, current_state: str, target_state: str, reason: str = "") -> None:
        msg = f"Invalid state transition for {entity}: cannot move from '{current_state}' to '{target_state}'."
        if reason:
            msg += f" Reason: {reason}"
        super().__init__(code="INVALID_STATE_TRANSITION", message=msg, status_code=400)


class CulturalConsentViolationError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(code="CULTURAL_CONSENT_VIOLATION", message=message, status_code=422)


class CreatorStateMachine:
    ALLOWED_TRANSITIONS: dict[CreatorStatus, set[CreatorStatus]] = {
        CreatorStatus.PENDING: {CreatorStatus.VERIFIED, CreatorStatus.REJECTED, CreatorStatus.SUSPENDED},
        CreatorStatus.VERIFIED: {CreatorStatus.SUSPENDED},
        CreatorStatus.REJECTED: {CreatorStatus.PENDING},  # Allowed to re-apply
        CreatorStatus.SUSPENDED: {CreatorStatus.VERIFIED, CreatorStatus.REJECTED},
    }

    @classmethod
    def transition(cls, current: CreatorStatus, target: CreatorStatus) -> CreatorStatus:
        allowed = cls.ALLOWED_TRANSITIONS.get(current, set())
        if target not in allowed:
            raise InvalidStateTransitionError("Creator", current.value, target.value)
        return target


class ContentStateMachine:
    ALLOWED_TRANSITIONS: dict[ContentStatus, set[ContentStatus]] = {
        ContentStatus.DRAFT: {ContentStatus.SUBMITTED, ContentStatus.ARCHIVED},
        ContentStatus.SUBMITTED: {ContentStatus.PROCESSING, ContentStatus.UNDER_REVIEW, ContentStatus.APPROVED, ContentStatus.REJECTED, ContentStatus.DRAFT},
        ContentStatus.PROCESSING: {ContentStatus.UNDER_REVIEW, ContentStatus.REJECTED},
        ContentStatus.UNDER_REVIEW: {ContentStatus.APPROVED, ContentStatus.REJECTED, ContentStatus.DRAFT},
        ContentStatus.APPROVED: {ContentStatus.PUBLISHED, ContentStatus.ARCHIVED},
        ContentStatus.PUBLISHED: {ContentStatus.HIDDEN, ContentStatus.ARCHIVED, ContentStatus.EXPIRED},
        ContentStatus.HIDDEN: {ContentStatus.PUBLISHED, ContentStatus.ARCHIVED},
        ContentStatus.EXPIRED: {ContentStatus.ARCHIVED, ContentStatus.PUBLISHED},  # can be restored if converted to evergreen
        ContentStatus.REJECTED: {ContentStatus.DRAFT, ContentStatus.ARCHIVED},
        ContentStatus.ARCHIVED: set(),  # Terminal state
    }

    @classmethod
    def transition(cls, current: ContentStatus, target: ContentStatus) -> ContentStatus:
        allowed = cls.ALLOWED_TRANSITIONS.get(current, set())
        if target not in allowed:
            raise InvalidStateTransitionError("SocialContent", current.value, target.value)
        return target


def validate_cultural_protection(
    sensitivity: CulturalSensitivityLevel,
    has_sacred_consent: bool,
    community_attribution: str | None,
) -> None:
    """
    Enforces cultural sensitivity and sacred ritual protection rules.
    Indigenous rituals, sacred groves (Devgudi), and community traditions cannot be published
    without explicit consent and community attribution.
    """
    if sensitivity in {CulturalSensitivityLevel.SACRED_RITUAL, CulturalSensitivityLevel.COMMUNITY_PROTECTED}:
        if not has_sacred_consent:
            raise CulturalConsentViolationError(
                f"Content flagged as '{sensitivity.value}' requires verified community/elder consent before submission."
            )
        if not community_attribution or not community_attribution.strip():
            raise CulturalConsentViolationError(
                f"Content flagged as '{sensitivity.value}' requires community attribution (e.g., 'Bastar Dhurwa Tribe Community Council')."
            )


def calculate_content_expiration(content_type: ContentType, is_evergreen: bool = False) -> datetime | None:
    """
    Stories default to a 24-hour expiration unless marked evergreen.
    Other formats (Reels, Videos, Cultural Stories) do not auto-expire.
    """
    if content_type == ContentType.STORY and not is_evergreen:
        return datetime.now(timezone.utc) + timedelta(hours=24)
    return None
