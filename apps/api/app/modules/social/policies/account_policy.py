from __future__ import annotations

from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.models.social_account import SocialAccount


class SocialAccountPolicy:
    """
    Central governance policies for Social Account lifecycle decisions.
    Enforces the invariant that ACCEPTED != ACTIVE.
    """

    @classmethod
    def _status(cls, account: SocialAccount) -> SocialAccountStatus:
        if isinstance(account.status, SocialAccountStatus):
            return account.status
        try:
            return SocialAccountStatus(account.status)
        except Exception:
            return SocialAccountStatus.PENDING

    @classmethod
    def can_verify(cls, account: SocialAccount) -> bool:
        """Accounts can be verified if PENDING, currently VERIFYING, or retrying after REJECTED."""
        return cls._status(account) in {
            SocialAccountStatus.PENDING,
            SocialAccountStatus.VERIFYING,
            SocialAccountStatus.REJECTED,
        }

    @classmethod
    def can_accept(cls, account: SocialAccount) -> bool:
        """
        Acceptance is an editorial review decision.
        The account MUST be in VERIFIED (or PENDING_ACCEPTANCE) status.
        """
        return cls._status(account) in {
            SocialAccountStatus.VERIFIED,
            SocialAccountStatus.PENDING_ACCEPTANCE,
        }

    @classmethod
    def can_reject(cls, account: SocialAccount) -> bool:
        """Accounts in PENDING, VERIFYING, VERIFIED, or ACCEPTED can be rejected."""
        return cls._status(account) in {
            SocialAccountStatus.PENDING,
            SocialAccountStatus.VERIFYING,
            SocialAccountStatus.VERIFIED,
            SocialAccountStatus.PENDING_ACCEPTANCE,
            SocialAccountStatus.ACCEPTED,
        }

    @classmethod
    def can_activate(cls, account: SocialAccount) -> bool:
        """
        Activation is an operational decision.
        Requires editorial acceptance first (ACCEPTED) or un-pausing (PAUSED).
        """
        return cls._status(account) in {
            SocialAccountStatus.ACCEPTED,
            SocialAccountStatus.PAUSED,
        }

    @classmethod
    def can_pause(cls, account: SocialAccount) -> bool:
        """Only ACTIVE accounts can be PAUSED."""
        return cls._status(account) == SocialAccountStatus.ACTIVE

    @classmethod
    def can_reactivate(cls, account: SocialAccount) -> bool:
        """Only PAUSED accounts can be reactivated back to ACTIVE."""
        return cls._status(account) == SocialAccountStatus.PAUSED

    @classmethod
    def can_disconnect(cls, account: SocialAccount) -> bool:
        """Accounts that are ACTIVE, PAUSED, PENDING, or REJECTED can be disconnected."""
        return cls._status(account) in {
            SocialAccountStatus.ACTIVE,
            SocialAccountStatus.PAUSED,
            SocialAccountStatus.PENDING,
            SocialAccountStatus.REJECTED,
        }


__all__ = ["SocialAccountPolicy"]
