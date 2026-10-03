from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Index, Integer, JSON, String, Text, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.social.domain.enums import CreatorStatus

if TYPE_CHECKING:
    from app.modules.social.models.social_account import SocialAccount
    from app.modules.social.models.social_content import SocialContent

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class Creator(Base):
    __tablename__ = "creators"

    __table_args__ = (
        Index("ix_creators_user_id", "user_id"),
        Index("ix_creators_handle", "handle", unique=True),
        Index("ix_creators_district", "district_id"),
        Index("ix_creators_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
        unique=True,
    )

    handle: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    display_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    district_id: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="bastar",
    )

    languages: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=lambda: ["cg", "hi"],
    )

    categories: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=lambda: ["Culture", "Travel"],
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=CreatorStatus.PENDING.value,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    followers_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    following_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    posts_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    featured_work_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
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

    contents: Mapped[list[SocialContent]] = relationship(
        "SocialContent",
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    social_accounts: Mapped[list[SocialAccount]] = relationship(
        "SocialAccount",
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    def to_domain(self):
        from app.modules.social.domain.models import SocialCreator as DomainSocialCreator

        return DomainSocialCreator(
            id=str(self.id),
            handle=self.handle,
            display_name=self.display_name,
            district_id=self.district_id,
            user_id=str(self.user_id) if self.user_id else None,
            bio=self.bio,
            avatar_url=self.avatar_url,
            languages=list(self.languages or []),
            categories=list(self.categories or []),
            status=self.status,
            is_verified=self.is_verified,
            followers_count=self.followers_count,
            following_count=self.following_count,
            posts_count=self.posts_count,
            featured_work_id=str(self.featured_work_id) if self.featured_work_id else None,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


# Canonical alias for domain alignment
SocialCreator = Creator
