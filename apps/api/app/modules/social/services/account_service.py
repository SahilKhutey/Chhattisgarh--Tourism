from __future__ import annotations

from ..domain.enums import SocialAccountStatus

ALLOWED_TRANSITIONS: dict[
    SocialAccountStatus,
    set[SocialAccountStatus],
] = {
    SocialAccountStatus.PENDING: {
        SocialAccountStatus.VERIFYING,
        SocialAccountStatus.REJECTED,
    },
    SocialAccountStatus.VERIFYING: {
        SocialAccountStatus.VERIFIED,
        SocialAccountStatus.REJECTED,
    },
    SocialAccountStatus.VERIFIED: {
        SocialAccountStatus.ACCEPTED,
        SocialAccountStatus.REJECTED,
    },
    SocialAccountStatus.ACCEPTED: {
        SocialAccountStatus.ACTIVE,
        SocialAccountStatus.REJECTED,
    },
    SocialAccountStatus.ACTIVE: {
        SocialAccountStatus.PAUSED,
        SocialAccountStatus.DISCONNECTED,
    },
    SocialAccountStatus.PAUSED: {
        SocialAccountStatus.ACTIVE,
        SocialAccountStatus.DISCONNECTED,
    },
    SocialAccountStatus.REJECTED: set(),
    SocialAccountStatus.DISCONNECTED: set(),
}


def transition_account(
    current: SocialAccountStatus,
    target: SocialAccountStatus,
) -> SocialAccountStatus:
    allowed = ALLOWED_TRANSITIONS[current]

    if target not in allowed:
        raise ValueError(
            f"Invalid social account transition: "
            f"{current} -> {target}"
        )

    return target
