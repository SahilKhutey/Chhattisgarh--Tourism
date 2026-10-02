from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.social.models.social_content import SocialContent


class SocialModerationLog(Base):
    __tablename__ = "social_moderation_logs"

    __table_args__ = (
        Index("ix_social_moderation_content_id", "content_id"),
        Index("ix_social_moderation_moderator_id", "moderator_id"),
        Index("ix_social_moderation_decision", "decision"),
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

    moderator_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=False,
    )

    decision: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    cultural_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    content: Mapped[SocialContent] = relationship(
        "SocialContent",
        back_populates="moderation_logs",
    )
