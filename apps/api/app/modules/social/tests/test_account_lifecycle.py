from __future__ import annotations

import pytest

from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.services.account_service import (
    transition_account,
)


def test_pending_can_enter_verification() -> None:
    result = transition_account(
        SocialAccountStatus.PENDING,
        SocialAccountStatus.VERIFYING,
    )

    assert result == SocialAccountStatus.VERIFYING


def test_verified_can_be_accepted() -> None:
    result = transition_account(
        SocialAccountStatus.VERIFIED,
        SocialAccountStatus.ACCEPTED,
    )

    assert result == SocialAccountStatus.ACCEPTED


def test_accepted_can_become_active() -> None:
    result = transition_account(
        SocialAccountStatus.ACCEPTED,
        SocialAccountStatus.ACTIVE,
    )

    assert result == SocialAccountStatus.ACTIVE


def test_pending_cannot_become_active() -> None:
    with pytest.raises(ValueError):
        transition_account(
            SocialAccountStatus.PENDING,
            SocialAccountStatus.ACTIVE,
        )
