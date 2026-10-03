from __future__ import annotations

import uuid
from datetime import datetime
from typing import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import SocialAccountStatus
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_log import SocialSyncRun
from app.modules.social.repositories.social_account_repository import (
    SocialAccountRepository as LegacySocialAccountRepository,
)


class SocialAccountRepository(LegacySocialAccountRepository):
    """Repository for SocialAccount persistence operations."""
    pass


__all__ = ["SocialAccountRepository"]
