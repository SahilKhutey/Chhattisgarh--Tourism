from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.modules.social.models.social_account import SocialAccount

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class SocialAccountVerification(Base):
    __tablename__ = "social_account_verifications"

    __table_args__ = (
        Index("ix_verifications_account_id", "social_account_id"),
        Index("ix_verifications_status", "status"),
        Index("ix_verifications_created_at", "created_at"),
    )

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

    status: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    provider_account_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    provider_handle: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    provider_display_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    details: Mapped[dict[str, Any]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    social_account: Mapped[SocialAccount] = relationship(
        "SocialAccount",
        back_populates="verifications",
    )


__all__ = ["SocialAccountVerification"]
