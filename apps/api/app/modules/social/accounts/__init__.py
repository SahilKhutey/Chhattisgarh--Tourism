from __future__ import annotations

from app.modules.social.accounts.models import DomainSocialAccount, SocialAccount
from app.modules.social.accounts.repository import SocialAccountRepository
from app.modules.social.accounts.schemas import (
    AdminCreatorRegister,
    SocialAccountAcceptPayload,
    SocialAccountCreate,
    SocialAccountRegisterRequest,
    SocialAccountResponse,
    SocialAccountUpdate,
)
from app.modules.social.accounts.service import (
    DuplicateSocialAccountError,
    SocialAccountNotFoundError,
    SocialAccountService,
)
from app.modules.social.accounts.validator import PLATFORM_HOSTS, SocialAccountValidator

__all__ = [
    "SocialAccount",
    "DomainSocialAccount",
    "SocialAccountRepository",
    "SocialAccountCreate",
    "SocialAccountRegisterRequest",
    "SocialAccountUpdate",
    "SocialAccountAcceptPayload",
    "SocialAccountResponse",
    "AdminCreatorRegister",
    "SocialAccountService",
    "SocialAccountNotFoundError",
    "DuplicateSocialAccountError",
    "SocialAccountValidator",
    "PLATFORM_HOSTS",
]
