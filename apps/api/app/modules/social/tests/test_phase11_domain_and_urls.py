from __future__ import annotations

import pytest
from unittest.mock import MagicMock

from app.core.errors import AppError
from app.modules.social.domain.enums import (
    ContentType,
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
    SocialContentType,
    SocialPlatform,
    SocialVisibility,
)
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.domain.state_machines import (
    CreatorStateMachine,
    InvalidStateTransitionError,
    SocialAccountStateMachine,
    ContentStateMachine,
)
from app.modules.social.domain.value_objects import SourceUrl
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.policies.sync_policy import SocialSyncPolicy
from app.modules.social.providers.registry import ProviderRegistry
from app.modules.social.source.validator import SourceValidator


# -----------------------------------------------------------------------------
# 11.6 Unit Tests — Domain Enums
# -----------------------------------------------------------------------------
def test_supported_social_platforms_and_types() -> None:
    # Platforms
    assert SocialPlatform.YOUTUBE.value == "youtube"
    assert SocialPlatform.INSTAGRAM.value == "instagram"

    # Content Types
    assert SocialContentType.POST.value == "post"
    assert SocialContentType.VIDEO.value == "video"
    assert SocialContentType.REEL.value == "reel"
    assert SocialContentType.SHORT.value == "short"
    assert SocialContentType.STORY.value == "story"

    # Account Statuses
    assert SocialAccountStatus.PENDING.value == "pending"
    assert SocialAccountStatus.VERIFYING.value == "verifying"
    assert SocialAccountStatus.VERIFIED.value == "verified"
    assert SocialAccountStatus.ACCEPTED.value == "accepted"
    assert SocialAccountStatus.ACTIVE.value == "active"
    assert SocialAccountStatus.PAUSED.value == "paused"
    assert SocialAccountStatus.REJECTED.value == "rejected"
    assert SocialAccountStatus.DISCONNECTED.value == "disconnected"

    # Content Statuses
    assert SocialContentStatus.DISCOVERED.value == "discovered"
    assert SocialContentStatus.SYNCED.value == "synced"
    assert SocialContentStatus.VALIDATED.value == "validated"
    assert SocialContentStatus.UNDER_REVIEW.value == "under_review"
    assert SocialContentStatus.APPROVED.value == "approved"
    assert SocialContentStatus.PUBLISHED.value == "published"
    assert SocialContentStatus.HIDDEN.value == "hidden"
    assert SocialContentStatus.SOURCE_DELETED.value == "source_deleted"
    assert SocialContentStatus.SOURCE_UNAVAILABLE.value == "source_unavailable"


# -----------------------------------------------------------------------------
# 11.7 Unit Tests — Source URL Validation & Scheme Rejection
# -----------------------------------------------------------------------------
def test_source_url_accepts_valid_https() -> None:
    valid_urls = [
        "https://youtube.com/@creator",
        "https://www.youtube.com/@creator",
        "https://www.instagram.com/creator/",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ]
    for url in valid_urls:
        source = SourceUrl.from_raw(url)
        assert source.value.startswith("https://")
        assert source.hostname != ""


def test_source_url_rejects_insecure_and_invalid_schemes() -> None:
    invalid_urls = [
        "http://youtube.com/@creator",
        "javascript:alert(1)",
        "file:///etc/passwd",
        "ftp://youtube.com/@creator",
        "https:///no-hostname",
        "not-a-url",
        "",
    ]
    for url in invalid_urls:
        with pytest.raises((SourceUrlError, ValueError)):
            SourceUrl.from_raw(url)


def test_source_validator_rejects_unsupported_provider_hosts() -> None:
    with pytest.raises(SourceUrlError) as exc_info:
        SourceValidator.validate_platform_url("https://vimeo.com/12345", SocialPlatform.YOUTUBE)
    assert "does not belong to youtube" in str(exc_info.value).lower()

    with pytest.raises(SourceUrlError) as exc_info:
        SourceValidator.validate_platform_url("https://tiktok.com/@creator", SocialPlatform.INSTAGRAM)
    assert "does not belong to instagram" in str(exc_info.value).lower()


# -----------------------------------------------------------------------------
# 11.8 Source URL Normalization Tests
# -----------------------------------------------------------------------------
def test_source_url_normalization() -> None:
    raw_input = "HTTPS://WWW.YouTube.COM/@Creator#section"
    normalized = SourceUrl.from_raw(raw_input).value
    assert normalized == "https://www.youtube.com/@Creator"

    # Query preservation where valid
    query_url = "HTTPS://WWW.YOUTUBE.COM/watch?v=abc12345&t=42s#comment"
    norm_query = SourceUrl.from_raw(query_url).value
    assert norm_query == "https://www.youtube.com/watch?v=abc12345&t=42s"


# -----------------------------------------------------------------------------
# 11.9 Provider Registry Tests
# -----------------------------------------------------------------------------
def test_provider_registry() -> None:
    registry = ProviderRegistry()
    mock_yt = MagicMock()
    mock_ig = MagicMock()

    registry.register(SocialPlatform.YOUTUBE, mock_yt)
    registry.register(SocialPlatform.INSTAGRAM, mock_ig)

    assert registry.get(SocialPlatform.YOUTUBE) is mock_yt
    assert registry.get(SocialPlatform.INSTAGRAM) is mock_ig

    # Lookup by string representation
    assert registry.get("youtube") is mock_yt

    # Unsupported provider raises UnsupportedPlatformError or KeyError
    from app.modules.social.domain.errors import UnsupportedPlatformError
    with pytest.raises((KeyError, UnsupportedPlatformError)):
        registry.get("TIKTOK")


# -----------------------------------------------------------------------------
# 11.10 & 11.11 Account Lifecycle Tests (Valid & Invalid Transitions)
# -----------------------------------------------------------------------------
def test_account_lifecycle_valid_transitions() -> None:
    # PENDING -> VERIFYING
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.PENDING, SocialAccountStatus.VERIFYING)
        == SocialAccountStatus.VERIFYING
    )
    # VERIFYING -> VERIFIED
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.VERIFYING, SocialAccountStatus.VERIFIED)
        == SocialAccountStatus.VERIFIED
    )
    # VERIFIED -> ACCEPTED
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.VERIFIED, SocialAccountStatus.ACCEPTED)
        == SocialAccountStatus.ACCEPTED
    )
    # ACCEPTED -> ACTIVE
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.ACCEPTED, SocialAccountStatus.ACTIVE)
        == SocialAccountStatus.ACTIVE
    )
    # ACTIVE -> PAUSED
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.ACTIVE, SocialAccountStatus.PAUSED)
        == SocialAccountStatus.PAUSED
    )
    # PAUSED -> ACTIVE
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.PAUSED, SocialAccountStatus.ACTIVE)
        == SocialAccountStatus.ACTIVE
    )
    # ACTIVE -> DISCONNECTED
    assert (
        SocialAccountStateMachine.transition(SocialAccountStatus.ACTIVE, SocialAccountStatus.DISCONNECTED)
        == SocialAccountStatus.DISCONNECTED
    )


def test_account_lifecycle_invalid_transitions() -> None:
    # Must reject PENDING -> ACTIVE (skipping verification & acceptance)
    with pytest.raises(InvalidStateTransitionError):
        SocialAccountStateMachine.transition(SocialAccountStatus.PENDING, SocialAccountStatus.ACTIVE)

    # Must reject REJECTED -> ACTIVE
    with pytest.raises(InvalidStateTransitionError):
        SocialAccountStateMachine.transition(SocialAccountStatus.REJECTED, SocialAccountStatus.ACTIVE)

    # Must reject DISCONNECTED -> ACTIVE directly without re-verification
    with pytest.raises(InvalidStateTransitionError):
        SocialAccountStateMachine.transition(SocialAccountStatus.DISCONNECTED, SocialAccountStatus.ACTIVE)


# -----------------------------------------------------------------------------
# 11.12 Sync Eligibility Tests
# -----------------------------------------------------------------------------
def test_sync_eligibility_matrix() -> None:
    account = SocialAccount(
        platform=SocialPlatform.YOUTUBE.value,
        handle="RaviBastar",
        status=SocialAccountStatus.ACTIVE.value,
        sync_enabled=True,
    )
    # 1. ACTIVE + enabled -> allowed
    assert SocialSyncPolicy.can_sync(account) is True

    # 2. ACTIVE + disabled -> denied
    account.sync_enabled = False
    assert SocialSyncPolicy.can_sync(account) is False

    # 3. PAUSED + enabled -> denied
    account.status = SocialAccountStatus.PAUSED.value
    account.sync_enabled = True
    assert SocialSyncPolicy.can_sync(account) is False

    # 4. ACCEPTED + enabled -> denied (editorial acceptance != active sync)
    account.status = SocialAccountStatus.ACCEPTED.value
    assert SocialSyncPolicy.can_sync(account) is False

    # 5. REJECTED + enabled -> denied
    account.status = SocialAccountStatus.REJECTED.value
    assert SocialSyncPolicy.can_sync(account) is False
