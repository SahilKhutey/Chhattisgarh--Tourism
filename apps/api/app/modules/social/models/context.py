from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Float, ForeignKey, Index, JSON, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.social.models.social_content import SocialContent

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class SocialContentContext(Base):
    __tablename__ = "social_content_context"

    __table_args__ = (
        Index("ix_social_content_context_content_id", "social_content_id"),
        Index("ix_social_content_context_type_id", "context_type", "context_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    social_content_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("social_contents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    context_type: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    context_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="admin",
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )

    metadata_json: Mapped[dict[str, Any]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    social_content: Mapped[SocialContent] = relationship(
        "SocialContent",
        back_populates="contexts",
    )


__all__ = ["SocialContentContext"]
