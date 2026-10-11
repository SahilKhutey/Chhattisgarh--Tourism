from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    desc,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SocialSyncRun(Base):
    __tablename__ = "social_sync_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    social_account_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("social_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    run_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )
    platform: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="YOUTUBE",
    )
    trigger: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="manual",
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="SUCCESS",
        index=True,
    )
    items_discovered: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    items_created: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    items_updated: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    items_skipped: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    items_failed: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    items_synced: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    error_code: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    metadata_json: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    social_account = relationship("SocialAccount", back_populates="sync_runs")

    __table_args__ = (
        Index("ix_social_sync_runs_account_started", "social_account_id", desc("started_at")),
    )


__all__ = ["SocialSyncRun"]
