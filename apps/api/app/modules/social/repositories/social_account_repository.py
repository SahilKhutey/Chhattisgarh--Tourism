from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import SocialAccountStatus, SyncHealthStatus
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_log import SocialSyncRun


class SocialAccountRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, account: SocialAccount) -> SocialAccount:
        self.session.add(account)
        self.session.flush()
        return account

    def get_by_id(self, account_id: uuid.UUID) -> SocialAccount | None:
        stmt = select(SocialAccount).where(SocialAccount.id == account_id)
        return self.session.scalar(stmt)

    def get_by_creator(self, creator_id: uuid.UUID) -> Sequence[SocialAccount]:
        stmt = select(SocialAccount).where(SocialAccount.creator_id == creator_id).order_by(SocialAccount.created_at.asc())
        return list(self.session.scalars(stmt).all())

    def get_by_platform_and_handle(self, platform: str, handle: str) -> SocialAccount | None:
        stmt = select(SocialAccount).where(
            SocialAccount.platform == platform,
            SocialAccount.handle == handle,
        )
        return self.session.scalar(stmt)

    def list_accounts(
        self,
        status: str | None = None,
        platform: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialAccount]:
        stmt = select(SocialAccount)
        if status:
            stmt = stmt.where(SocialAccount.status == status)
        if platform:
            stmt = stmt.where(SocialAccount.platform == platform)
        stmt = stmt.order_by(desc(SocialAccount.priority), desc(SocialAccount.created_at)).limit(limit).offset(offset)
        return list(self.session.scalars(stmt).all())

    def list_active_accounts_for_sync(self) -> Sequence[SocialAccount]:
        stmt = select(SocialAccount).where(
            SocialAccount.status == SocialAccountStatus.ACTIVE.value,
            SocialAccount.is_sync_enabled.is_(True),
        ).order_by(desc(SocialAccount.priority))
        return list(self.session.scalars(stmt).all())

    def record_sync_run(
        self,
        account_id: uuid.UUID,
        status: str,
        items_discovered: int,
        items_synced: int,
        started_at: datetime,
        finished_at: datetime,
        error_message: str | None = None,
    ) -> SocialSyncRun:
        run = SocialSyncRun(
            social_account_id=account_id,
            status=status,
            items_discovered=items_discovered,
            items_synced=items_synced,
            started_at=started_at,
            finished_at=finished_at,
            error_message=error_message,
        )
        self.session.add(run)
        self.session.flush()
        return run
