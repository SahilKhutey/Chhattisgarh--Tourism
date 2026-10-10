from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import SyncStatus
from app.modules.social.models.sync_state import SocialAccountSyncState


class SocialSyncStateRepository:
    """Repository for SocialAccountSyncState persistence operations."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.db = session

    def get_by_account_id(self, account_id: uuid.UUID) -> SocialAccountSyncState | None:
        stmt = select(SocialAccountSyncState).where(SocialAccountSyncState.social_account_id == account_id)
        return self.session.scalar(stmt)

    def get_or_create(self, account_id: uuid.UUID) -> SocialAccountSyncState:
        state = self.get_by_account_id(account_id)
        if state is None:
            state = SocialAccountSyncState(
                social_account_id=account_id,
                sync_status=SyncStatus.NEVER_RUN.value,
                sync_enabled=True,
            )
            self.session.add(state)
            self.session.flush()
        return state

    def save(self, state: SocialAccountSyncState) -> SocialAccountSyncState:
        self.session.add(state)
        self.session.flush()
        return state

    def record_sync_success(
        self,
        account_id: uuid.UUID,
        discovered: int = 0,
        created: int = 0,
        updated: int = 0,
        failed: int = 0,
        cursor: str | None = None,
        etag: str | None = None,
        started_at: datetime | None = None,
        finished_at: datetime | None = None,
    ) -> SocialAccountSyncState:
        state = self.get_or_create(account_id)
        now = datetime.now(timezone.utc)
        state.sync_status = SyncStatus.SUCCEEDED.value
        state.last_started_at = started_at or state.last_started_at or now
        state.last_finished_at = finished_at or now
        state.last_synced_at = state.last_finished_at
        state.last_successful_sync_at = state.last_finished_at
        state.consecutive_failures = 0
        state.last_error = None
        state.cursor = cursor or state.cursor
        state.etag = etag or state.etag
        state.discovered_count += discovered
        state.created_count += created
        state.updated_count += updated
        state.failed_count += failed
        state.items_synced_total += (created + updated)
        self.session.flush()
        return state

    def record_sync_failure(
        self,
        account_id: uuid.UUID,
        error: str,
        started_at: datetime | None = None,
        finished_at: datetime | None = None,
    ) -> SocialAccountSyncState:
        state = self.get_or_create(account_id)
        now = datetime.now(timezone.utc)
        state.sync_status = SyncStatus.FAILED.value
        state.last_started_at = started_at or state.last_started_at or now
        state.last_finished_at = finished_at or now
        state.consecutive_failures += 1
        state.last_error = error
        self.session.flush()
        return state

    def list_active_states(self, limit: int = 50, offset: int = 0) -> Sequence[SocialAccountSyncState]:
        stmt = (
            select(SocialAccountSyncState)
            .where(SocialAccountSyncState.sync_enabled.is_(True))
            .order_by(desc(SocialAccountSyncState.last_synced_at.nulls_first()))
            .limit(limit)
            .offset(offset)
        )
        return list(self.session.scalars(stmt).all())


SyncStateRepository = SocialSyncStateRepository

__all__ = ["SocialSyncStateRepository", "SyncStateRepository"]
