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

    def set_verified(
        self,
        account_id: uuid.UUID,
        external_account_id: str | None = None,
        handle: str | None = None,
    ) -> SocialAccount | None:
        account = self.get_by_id(account_id)
        if account:
            account.status = SocialAccountStatus.VERIFIED.value
            if external_account_id:
                account.external_account_id = external_account_id
            if handle:
                account.handle = handle
            self.session.flush()
        return account

    def accept(self, account_id: uuid.UUID) -> SocialAccount | None:
        account = self.get_by_id(account_id)
        if account:
            account.status = SocialAccountStatus.ACCEPTED.value
            self.session.flush()
        return account

    def activate(self, account_id: uuid.UUID) -> SocialAccount | None:
        account = self.get_by_id(account_id)
        if account:
            account.status = SocialAccountStatus.ACTIVE.value
            account.sync_enabled = True
            self.session.flush()
        return account

    def reject(self, account_id: uuid.UUID, reason: str | None = None) -> SocialAccount | None:
        account = self.get_by_id(account_id)
        if account:
            account.status = SocialAccountStatus.REJECTED.value
            account.sync_enabled = False
            if reason:
                account.last_error = reason
            self.session.flush()
        return account


__all__ = ["SocialAccountRepository"]
