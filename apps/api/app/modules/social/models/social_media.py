from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.social.models.social_content import SocialContent


class SocialMedia(Base):
    __tablename__ = "social_media"

    __table_args__ = (
        Index("ix_social_media_content_id", "content_id"),
        Index("ix_social_media_media_type", "media_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    content_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("social_contents.id", ondelete="CASCADE"),
        nullable=False,
    )

    media_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="IMAGE",
    )

    media_url: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    thumbnail_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    poster_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    duration_seconds: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    aspect_ratio: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="9:16",
    )

    resolution: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        default="1080x1920",
    )

    captions_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    transcript: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    language: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="hi",
    )

    processing_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="READY",
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    content: Mapped[SocialContent] = relationship(
        "SocialContent",
        back_populates="media_items",
    )
