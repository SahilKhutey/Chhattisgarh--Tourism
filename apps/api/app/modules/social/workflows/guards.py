from __future__ import annotations

import uuid
from typing import Any

from app.core.errors import AppError
from app.modules.social.domain.enums import (
    CreatorStatus,
    SocialAccountStatus,
    SocialContentStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.social_content import SocialContent
from app.modules.social.policies.account_policy import SocialAccountPolicy
from app.modules.social.policies.content_policy import SocialContentPolicy
from app.modules.social.policies.publication_policy import SocialPublicationPolicy
from app.modules.social.policies.sync_policy import SocialSyncPolicy


# Standardized error definitions (Section 9.63)
class SocialWorkflowError(AppError):
    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        super().__init__(code=code, message=message, status_code=status_code)


class CreatorNotEditableError(SocialWorkflowError):
    def __init__(self, creator_id: uuid.UUID | str, status: str) -> None:
        super().__init__(
            code="SOCIAL_CREATOR_NOT_EDITABLE",
            message=f"Creator '{creator_id}' in state '{status}' is not editable.",
            status_code=400,
        )


class AccountNotVerifiableError(SocialWorkflowError):
    def __init__(self, account_id: uuid.UUID | str, status: str) -> None:
        super().__init__(
            code="SOCIAL_ACCOUNT_NOT_VERIFIABLE",
            message=f"Account '{account_id}' in state '{status}' is not eligible for verification.",
            status_code=400,
        )


class AccountAcceptanceNotAllowedError(SocialWorkflowError):
    def __init__(self, account_id: uuid.UUID | str, status: str) -> None:
        super().__init__(
            code="SOCIAL_ACCOUNT_ACCEPTANCE_NOT_ALLOWED",
            message=f"Account '{account_id}' in state '{status}' cannot be accepted. Account must be VERIFIED first.",
            status_code=400,
        )


class AccountSyncNotAllowedError(SocialWorkflowError):
    def __init__(self, account_id: uuid.UUID | str, reason: str) -> None:
        super().__init__(
            code="SOCIAL_ACCOUNT_SYNC_DISABLED",
            message=f"Synchronization not allowed for account '{account_id}': {reason}",
            status_code=400,
        )


class ContentNotModeratableError(SocialWorkflowError):
    def __init__(self, content_id: uuid.UUID | str, status: str) -> None:
        super().__init__(
            code="SOCIAL_CONTENT_NOT_MODERATABLE",
            message=f"Content '{content_id}' in state '{status}' cannot be moderated.",
            status_code=400,
        )


class ContentNotPublishableError(SocialWorkflowError):
    def __init__(self, content_id: uuid.UUID | str, reason: str) -> None:
        super().__init__(
            code="SOCIAL_CONTENT_NOT_PUBLISHABLE",
            message=f"Content '{content_id}' cannot be published: {reason}",
            status_code=400,
        )


class InvalidGeographyReferenceError(SocialWorkflowError):
    def __init__(self, message: str) -> None:
        super().__init__(
            code="SOCIAL_INVALID_GEOGRAPHY_REFERENCE",
            message=message,
            status_code=422,
        )


# Known valid districts in Chhattisgarh
VALID_CG_DISTRICTS = {
    "bastar",
    "dantewada",
    "surguja",
    "raipur",
    "bilaspur",
    "durg",
    "korba",
    "kanker",
    "kondagaon",
    "jashpur",
    "sukma",
    "bijapur",
    "narayanpur",
    "mahasamund",
    "rajnandgaon",
    "kabirdham",
    "balod",
    "bemetara",
    "baloda-bazar",
    "gariaband",
    "dhamtari",
    "mungeli",
    "raigarh",
    "janjgir-champa",
    "shakti",
    "korea",
    "manendragarh-chirmiri-bharatpur",
    "surajpur",
    "balrampur",
    "khairagarh-chhuikhadan-gandai",
    "mohla-manpur-ambagarh-chowki",
    "sarangarh-bilaigarh",
    "gaurela-pendra-marwahi",
}

# Known canonical place -> district mapping for relationship validation (Section 9.30)
PLACE_DISTRICT_GRAPH: dict[str, str] = {
    "chitrakote-falls": "bastar",
    "tirathgarh-falls": "bastar",
    "kanger-valley": "bastar",
    "danteshwari-temple": "dantewada",
    "barsur-temples": "dantewada",
    "mainpat": "surguja",
    "tiger-point": "surguja",
    "sirpur": "mahasamund",
    "barnawapara": "mahasamund",
    "champaran": "raipur",
    "rathanpur": "bilaspur",
    "madku-dweep": "bilaspur",
}


def _val(x: Any) -> str:
    return x.value if hasattr(x, "value") else str(x)


def assert_creator_editable(creator: Creator) -> None:
    """Verifies that creator is not archived or permanently rejected."""
    if creator.status in {CreatorStatus.SUSPENDED}:
        raise CreatorNotEditableError(creator.id, _val(creator.status))


def assert_account_verifiable(account: SocialAccount) -> None:
    """Verifies that account is in a verifiable state."""
    if not SocialAccountPolicy.can_verify(account):
        raise AccountNotVerifiableError(account.id, _val(account.status))


def assert_account_acceptance_allowed(account: SocialAccount) -> None:
    """Verifies account is eligible for editorial acceptance (must be VERIFIED)."""
    if not SocialAccountPolicy.can_accept(account):
        raise AccountAcceptanceNotAllowedError(account.id, _val(account.status))


def assert_account_sync_allowed(account: SocialAccount) -> None:
    """Verifies account meets all operational sync criteria."""
    status_str = _val(account.status)
    if status_str != SocialAccountStatus.ACTIVE.value:
        raise AccountSyncNotAllowedError(
            account.id, f"Account status is '{status_str}'; must be ACTIVE"
        )
    if not getattr(account, "sync_enabled", False):
        raise AccountSyncNotAllowedError(account.id, "Synchronization is disabled")
    if getattr(account, "is_blocked", False):
        raise AccountSyncNotAllowedError(account.id, "Account is blocked by provider error")
    if SocialSyncPolicy.is_quota_limited(account):
        raise AccountSyncNotAllowedError(account.id, "Provider quota limit active; backoff required")


def assert_content_moderatable(content: SocialContent) -> None:
    """Verifies content is in a state where moderation decisions can be made."""
    if not SocialContentPolicy.is_moderatable(content):
        raise ContentNotModeratableError(content.id, _val(content.status))


def assert_content_publishable(
    content: SocialContent,
    creator: Creator | None = None,
    account: SocialAccount | None = None,
) -> None:
    """Verifies content is publishable according to publication policy."""
    status_str = _val(content.status)
    if status_str.lower() != SocialContentStatus.APPROVED.value.lower():
        raise ContentNotPublishableError(
            content.id, f"Content status is '{status_str}'; must be APPROVED"
        )
    if not SocialPublicationPolicy.source_available(content):
        raise ContentNotPublishableError(content.id, "Original platform source is unavailable or deleted")
    if not SocialPublicationPolicy.creator_active(creator):
        raise ContentNotPublishableError(content.id, "Creator is suspended or inactive")
    if not SocialPublicationPolicy.account_active(account):
        raise ContentNotPublishableError(content.id, "Social account is paused, disconnected, or inactive")


def assert_geography_valid(district_id: str | None, place_slug: str | None = None) -> None:
    """
    Validates geographic entities and prevents cross-district mismatches.
    Section 9.10 & 9.30.
    """
    if district_id:
        norm_district = district_id.lower().strip()
        if norm_district not in VALID_CG_DISTRICTS:
            raise InvalidGeographyReferenceError(
                f"Unknown district '{district_id}'. Must be one of the 33 official Chhattisgarh districts."
            )

    if place_slug and district_id:
        norm_place = place_slug.lower().strip()
        norm_district = district_id.lower().strip()
        expected_district = PLACE_DISTRICT_GRAPH.get(norm_place)
        if expected_district and expected_district != norm_district:
            raise InvalidGeographyReferenceError(
                f"Place '{place_slug}' belongs to district '{expected_district}', not '{district_id}'."
            )


__all__ = [
    "SocialWorkflowError",
    "CreatorNotEditableError",
    "AccountNotVerifiableError",
    "AccountAcceptanceNotAllowedError",
    "AccountSyncNotAllowedError",
    "ContentNotModeratableError",
    "ContentNotPublishableError",
    "InvalidGeographyReferenceError",
    "VALID_CG_DISTRICTS",
    "PLACE_DISTRICT_GRAPH",
    "assert_creator_editable",
    "assert_account_verifiable",
    "assert_account_acceptance_allowed",
    "assert_account_sync_allowed",
    "assert_content_moderatable",
    "assert_content_publishable",
    "assert_geography_valid",
]
