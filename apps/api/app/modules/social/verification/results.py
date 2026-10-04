from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class VerificationStatus(StrEnum):
    VERIFIED = "VERIFIED"
    NOT_FOUND = "NOT_FOUND"
    PRIVATE = "PRIVATE"
    UNAVAILABLE = "UNAVAILABLE"
    PROVIDER_ERROR = "PROVIDER_ERROR"
    MISMATCH = "MISMATCH"


class CreatorVerificationLevel(StrEnum):
    UNVERIFIED = "UNVERIFIED"
    IDENTITY_CHECKED = "IDENTITY_CHECKED"
    REGIONAL_CREATOR = "REGIONAL_CREATOR"
    OFFICIAL_CREATOR = "OFFICIAL_CREATOR"
    FEATURED_CREATOR = "FEATURED_CREATOR"


@dataclass(frozen=True, slots=True)
class VerificationResult:
    verified: bool
    external_account_id: str | None = None
    handle: str | None = None
    display_name: str | None = None
    profile_url: str | None = None
    reason: str | None = None
    status: VerificationStatus = VerificationStatus.VERIFIED


__all__ = [
    "VerificationStatus",
    "CreatorVerificationLevel",
    "VerificationResult",
]
