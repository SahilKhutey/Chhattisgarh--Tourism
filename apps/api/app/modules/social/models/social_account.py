from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.modules.social.domain.enums import (
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
    SyncStatus,
)


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("creators.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    platform: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=SocialPlatform.YOUTUBE.value,
        index=True,
    )
    handle: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        index=True,
    )
    display_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    external_account_id: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    profile_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    account_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="CREATOR",
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=SocialAccountStatus.PENDING.value,
        index=True,
    )
    sync_status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=SyncStatus.NEVER_RUN.value,
    )
    is_sync_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    sync_frequency_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=60,
    )
    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=50,
    )
    content_types_allowed: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: ["VIDEO", "SHORT", "REEL", "POST"],
    )
    max_items: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=30,
    )
    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    sync_health: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=SyncHealthStatus.HEALTHY.value,
        index=True,
    )
    last_successful_sync: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    last_attempted_sync: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    last_error: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    consecutive_failures: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    sync_cursor: Mapped[str | None] = mapped_column(
        String(256),
        nullable=True,
    )
    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
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

    creator = relationship("Creator", back_populates="social_accounts")
    contents = relationship("SocialContent", back_populates="social_account", cascade="all, delete-orphan")
    sync_runs = relationship("SocialSyncRun", back_populates="social_account", cascade="all, delete-orphan")
    sync_state = relationship("SocialAccountSyncState", back_populates="social_account", uselist=False, cascade="all, delete-orphan")
    verifications = relationship("SocialAccountVerification", back_populates="social_account", cascade="all, delete-orphan", order_by="desc(SocialAccountVerification.created_at)")

    __table_args__ = (
        UniqueConstraint("creator_id", "platform", "handle", name="uq_social_account_creator_platform_handle"),
        Index("ix_social_accounts_status_platform", "status", "platform"),
        Index("ix_social_accounts_external_id", "external_account_id"),
        Index("ix_social_accounts_sync_status", "sync_status"),
        Index(
            "uq_social_account_external_identity",
            "platform",
            "external_account_id",
            unique=True,
            postgresql_where=text("external_account_id IS NOT NULL"),
            sqlite_where=text("external_account_id IS NOT NULL"),
        ),
        Index("ix_social_accounts_platform_url", "platform", "profile_url"),
    )

    @property
    def sync_enabled(self) -> bool:
        return self.is_sync_enabled

    @sync_enabled.setter
    def sync_enabled(self, val: bool) -> None:
        self.is_sync_enabled = val

    @property
    def last_synced_at(self) -> datetime | None:
        return self.last_attempted_sync

    @last_synced_at.setter
    def last_synced_at(self, val: datetime | None) -> None:
        self.last_attempted_sync = val

    @property
    def last_successful_sync_at(self) -> datetime | None:
        return self.last_successful_sync

    @last_successful_sync_at.setter
    def last_successful_sync_at(self, val: datetime | None) -> None:
        self.last_successful_sync = val

    def to_domain(self):

        from app.modules.social.domain.models import SocialAccount as DomainSocialAccount

        return DomainSocialAccount(
            id=str(self.id),
            creator_id=str(self.creator_id),
            platform=SocialPlatform(self.platform),
            profile_url=self.profile_url or "",
            handle=self.handle,
            display_name=self.display_name,
            external_account_id=self.external_account_id,
            status=SocialAccountStatus(self.status) if isinstance(self.status, str) else self.status,
            sync_status=SyncStatus(self.sync_status) if self.sync_status else SyncStatus.NEVER_RUN,
            sync_enabled=self.is_sync_enabled,
            last_synced_at=self.last_attempted_sync,
            last_successful_sync_at=self.last_successful_sync,
            last_error=self.last_error,
            metadata=dict(self.metadata_json) if self.metadata_json else {},
        )

    @classmethod
    def from_domain(cls, domain_acc):
        return cls(
            id=uuid.UUID(domain_acc.id) if isinstance(domain_acc.id, str) else domain_acc.id,
            creator_id=uuid.UUID(domain_acc.creator_id) if isinstance(domain_acc.creator_id, str) else domain_acc.creator_id,
            platform=domain_acc.platform.value if hasattr(domain_acc.platform, "value") else str(domain_acc.platform),
            handle=domain_acc.handle,
            profile_url=domain_acc.profile_url,
            display_name=domain_acc.display_name,
            external_account_id=domain_acc.external_account_id,
            status=domain_acc.status.value if hasattr(domain_acc.status, "value") else str(domain_acc.status),
            sync_status=domain_acc.sync_status.value if hasattr(domain_acc.sync_status, "value") else str(domain_acc.sync_status),
            is_sync_enabled=domain_acc.sync_enabled,
            last_attempted_sync=domain_acc.last_synced_at,
            last_successful_sync=domain_acc.last_successful_sync_at,
            last_error=domain_acc.last_error,
            metadata_json=dict(domain_acc.metadata) if domain_acc.metadata else {},
        )
