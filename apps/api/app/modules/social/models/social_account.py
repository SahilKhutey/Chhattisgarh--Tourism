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
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.modules.social.domain.enums import (
    SocialAccountStatus,
    SocialPlatform,
    SyncHealthStatus,
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

    __table_args__ = (
        UniqueConstraint("creator_id", "platform", "handle", name="uq_social_account_creator_platform_handle"),
        Index("ix_social_accounts_status_platform", "status", "platform"),
    )
