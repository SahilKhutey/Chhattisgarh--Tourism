from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy import desc, or_, select
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import (
    ProviderAccessStatus,
    SocialAccountStatus,
    SyncStatus,
)
from app.modules.social.models.social_account import SocialAccount
from app.modules.social.models.sync_log import SocialSyncRun
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
        skipped: int = 0,
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
        state.last_error_code = None
        state.cursor = cursor or state.cursor
        state.etag = etag or state.etag
        state.discovered_count += discovered
        state.created_count += created
        state.updated_count += updated
        state.skipped_count += skipped
        state.failed_count += failed
        state.items_synced_total += (created + updated)
        self.session.flush()
        return state

    def record_sync_partial(
        self,
        account_id: uuid.UUID,
        discovered: int = 0,
        created: int = 0,
        updated: int = 0,
        skipped: int = 0,
        failed: int = 0,
        cursor: str | None = None,
        etag: str | None = None,
        started_at: datetime | None = None,
        finished_at: datetime | None = None,
        error: str | None = None,
    ) -> SocialAccountSyncState:
        state = self.get_or_create(account_id)
        now = datetime.now(timezone.utc)
        state.sync_status = SyncStatus.PARTIAL.value
        state.last_started_at = started_at or state.last_started_at or now
        state.last_finished_at = finished_at or now
        state.last_synced_at = state.last_finished_at
        state.last_successful_sync_at = state.last_finished_at
        state.last_error = error
        state.cursor = cursor or state.cursor
        state.etag = etag or state.etag
        state.discovered_count += discovered
        state.created_count += created
        state.updated_count += updated
        state.skipped_count += skipped
        state.failed_count += failed
        state.items_synced_total += (created + updated)
        self.session.flush()
        return state

    def record_sync_failure(
        self,
        account_id: uuid.UUID,
        error: str,
        error_code: str | None = None,
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
        state.last_error_code = error_code
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

    def find_due_accounts(
        self,
        now: datetime | None = None,
        limit: int = 100,
    ) -> Sequence[SocialAccount]:
        """Find active accounts eligible and due for scheduled synchronization."""
        now = now or datetime.now(timezone.utc)
        stmt = (
            select(SocialAccount)
            .where(
                SocialAccount.status == SocialAccountStatus.ACTIVE.value,
                SocialAccount.is_sync_enabled.is_(True),
                SocialAccount.provider_access_status == ProviderAccessStatus.AVAILABLE.value,
                or_(
                    SocialAccount.next_sync_at <= now,
                    SocialAccount.next_sync_at.is_(None),
                ),
            )
            .order_by(
                desc(SocialAccount.priority),
                SocialAccount.next_sync_at.asc().nulls_first(),
            )
            .limit(limit)
        )
        return list(self.session.scalars(stmt).all())


class SocialSyncRunRepository:
    """Repository for managing synchronization execution history runs."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, run: SocialSyncRun) -> SocialSyncRun:
        self.session.add(run)
        self.session.flush()
        return run

    def get_by_id(self, run_id: uuid.UUID) -> SocialSyncRun | None:
        stmt = select(SocialSyncRun).where(SocialSyncRun.id == run_id)
        return self.session.scalar(stmt)

    def get_by_run_id(self, run_id_str: str) -> SocialSyncRun | None:
        stmt = select(SocialSyncRun).where(SocialSyncRun.run_id == run_id_str)
        return self.session.scalar(stmt)

    def list_by_account(
        self,
        account_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialSyncRun]:
        stmt = (
            select(SocialSyncRun)
            .where(SocialSyncRun.social_account_id == account_id)
            .order_by(desc(SocialSyncRun.started_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self.session.scalars(stmt).all())

    def get_latest_for_account(self, account_id: uuid.UUID) -> SocialSyncRun | None:
        stmt = (
            select(SocialSyncRun)
            .where(SocialSyncRun.social_account_id == account_id)
            .order_by(desc(SocialSyncRun.started_at))
            .limit(1)
        )
        return self.session.scalar(stmt)

    def record_run(
        self,
        account_id: uuid.UUID,
        platform: str,
        trigger: str = "manual",
        status: str = "RUNNING",
        run_id: str | None = None,
        items_discovered: int = 0,
        items_created: int = 0,
        items_updated: int = 0,
        items_skipped: int = 0,
        items_failed: int = 0,
        error_code: str | None = None,
        error_message: str | None = None,
        metadata_json: dict[str, Any] | None = None,
        started_at: datetime | None = None,
        finished_at: datetime | None = None,
    ) -> SocialSyncRun:
        run = SocialSyncRun(
            social_account_id=account_id,
            run_id=run_id or uuid.uuid4().hex[:16],
            platform=platform,
            trigger=trigger,
            status=status,
            items_discovered=items_discovered,
            items_created=items_created,
            items_updated=items_updated,
            items_skipped=items_skipped,
            items_failed=items_failed,
            items_synced=items_created + items_updated,
            error_code=error_code,
            error_message=error_message,
            metadata_json=metadata_json or {},
            started_at=started_at or datetime.now(timezone.utc),
            finished_at=finished_at,
        )
        self.session.add(run)
        self.session.flush()
        return run


SyncStateRepository = SocialSyncStateRepository

__all__ = [
    "SocialSyncStateRepository",
    "SyncStateRepository",
    "SocialSyncRunRepository",
]
