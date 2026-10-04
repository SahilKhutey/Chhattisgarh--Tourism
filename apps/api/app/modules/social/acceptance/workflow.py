from __future__ import annotations

from typing import Any

from app.core.errors import AppError
from app.modules.social.domain.enums import SocialAccountStatus


class ConcurrencyStateConflictError(AppError):
    def __init__(self, message: str = "Account status was concurrently modified.") -> None:
        super().__init__(code="CONCURRENT_STATE_CONFLICT", message=message, status_code=409)


class SocialAcceptanceWorkflow:
    """Manages legal state transitions and optimistic concurrency guards for account acceptance."""

    ALLOWED_TRANSITIONS = {
        SocialAccountStatus.PENDING: {SocialAccountStatus.VERIFYING},
        SocialAccountStatus.VERIFYING: {SocialAccountStatus.VERIFIED, SocialAccountStatus.REJECTED},
        SocialAccountStatus.VERIFIED: {
            SocialAccountStatus.PENDING_ACCEPTANCE,
            SocialAccountStatus.ACCEPTED,
            SocialAccountStatus.REJECTED,
            SocialAccountStatus.PENDING,  # Changes requested
        },
        SocialAccountStatus.PENDING_ACCEPTANCE: {
            SocialAccountStatus.ACCEPTED,
            SocialAccountStatus.REJECTED,
            SocialAccountStatus.PENDING,  # Changes requested
        },
        SocialAccountStatus.ACCEPTED: {
            SocialAccountStatus.ACTIVE,
            SocialAccountStatus.REJECTED,
            SocialAccountStatus.PAUSED,
        },
        SocialAccountStatus.ACTIVE: {
            SocialAccountStatus.PAUSED,
            SocialAccountStatus.REJECTED,
            SocialAccountStatus.DISCONNECTED,
        },
        SocialAccountStatus.PAUSED: {
            SocialAccountStatus.ACTIVE,
            SocialAccountStatus.REJECTED,
        },
        SocialAccountStatus.REJECTED: {
            SocialAccountStatus.VERIFYING,  # Re-attempt
            SocialAccountStatus.PENDING,
        },
    }

    @classmethod
    def can_transition(cls, current: SocialAccountStatus, target: SocialAccountStatus) -> bool:
        if current == target:
            return True  # Idempotent
        return target in cls.ALLOWED_TRANSITIONS.get(current, set())

    @classmethod
    def transition(cls, current: SocialAccountStatus, target: SocialAccountStatus) -> SocialAccountStatus:
        if current == target:
            return current
        if not cls.can_transition(current, target):
            raise ValueError(f"Illegal state transition from {current.value} to {target.value}.")
        return target

    @classmethod
    def verify_expected_state(cls, account: Any, expected_status: SocialAccountStatus | set[SocialAccountStatus]) -> None:
        status_val = getattr(account, "status", None)
        current = SocialAccountStatus(status_val) if isinstance(status_val, str) else status_val

        allowed = {expected_status} if isinstance(expected_status, SocialAccountStatus) else expected_status
        if current not in allowed:
            raise ConcurrencyStateConflictError(
                f"Expected status {[s.value for s in allowed]}, but account is currently '{current.value}'."
            )


__all__ = [
    "SocialAcceptanceWorkflow",
    "ConcurrencyStateConflictError",
]
