from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.social.domain.enums import SyncStatus
from app.modules.social.domain.models import SocialSyncState as DomainSocialSyncState

if TYPE_CHECKING:
    from app.modules.social.models.social_account import SocialAccount


class SocialAccountSyncState(Base):
    __tablename__ = "social_account_sync_states"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    social_account_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    sync_status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=SyncStatus.NEVER_RUN.value,
        index=True,
    )

    sync_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_successful_sync_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    consecutive_failures: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    last_error: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    cursor: Mapped[str | None] = mapped_column(
        String(256),
        nullable=True,
    )

    items_synced_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    social_account: Mapped[SocialAccount] = relationship(
        "SocialAccount",
        back_populates="sync_state",
    )

    def to_domain(self) -> DomainSocialSyncState:
        return DomainSocialSyncState(
            id=str(self.id),
            social_account_id=str(self.social_account_id),
            sync_status=SyncStatus(self.sync_status) if self.sync_status else SyncStatus.NEVER_RUN,
            sync_enabled=self.sync_enabled,
            last_synced_at=self.last_synced_at,
            last_successful_sync_at=self.last_successful_sync_at,
            consecutive_failures=self.consecutive_failures,
            last_error=self.last_error,
            cursor=self.cursor,
            items_synced_total=self.items_synced_total,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
