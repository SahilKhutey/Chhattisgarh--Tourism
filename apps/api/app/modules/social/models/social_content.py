from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    Uuid,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CulturalSensitivityLevel,
    LicenseType,
    ModerationStatus,
)

if TYPE_CHECKING:
    from app.modules.social.models.creator import Creator
    from app.modules.social.models.moderation import SocialModerationLog
    from app.modules.social.models.social_media import SocialMedia

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class SocialContent(Base):
    __tablename__ = "social_contents"

    __table_args__ = (
        Index("ix_social_contents_creator_id", "creator_id"),
        Index("ix_social_contents_content_type", "content_type"),
        Index("ix_social_contents_pub_status", "publication_status"),
        Index("ix_social_contents_mod_status", "moderation_status"),
        Index("ix_social_contents_district_id", "district_id"),
        Index("ix_social_contents_place_id", "place_id"),
        Index("ix_social_contents_place_slug", "place_slug"),
        Index("ix_social_contents_expires_at", "expires_at"),
        Index("ix_social_contents_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    creator_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("creators.id", ondelete="CASCADE"),
        nullable=False,
    )

    content_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=ContentType.POST.value,
    )

    title: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
    )

    caption: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    slug: Mapped[str] = mapped_column(
        String(280),
        nullable=False,
        unique=True,
    )

    # Tourism Entity Graph Links
    district_id: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="bastar",
    )

    tourism_zone_id: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )

    place_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    place_slug: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    route_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    experience_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    festival_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # Template Engine Bridging
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    template_version_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )

    template_payload: Mapped[dict[str, Any]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=dict,
    )

    # Cultural Protection & Taxonomy
    cultural_tags: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=list,
    )

    tourism_tags: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=list,
    )

    hashtags: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=list,
    )

    language: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="hi",
    )

    cultural_sensitivity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=CulturalSensitivityLevel.STANDARD.value,
    )

    license_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=LicenseType.ORIGINAL_CREATOR.value,
    )

    source_attribution: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    community_attribution: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    has_sacred_consent: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    # Lifecycle & Publishing
    visibility: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ContentVisibility.PUBLIC.value,
    )

    moderation_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=ModerationStatus.PENDING.value,
    )

    publication_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=ContentStatus.DRAFT.value,
    )

    is_evergreen: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Engagement Counters
    likes_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    comments_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    saves_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    shares_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    trip_adds_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    views_count: Mapped[int] = mapped_column(
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

    # Relationships
    creator: Mapped[Creator] = relationship(
        "Creator",
        back_populates="contents",
    )

    media_items: Mapped[list[SocialMedia]] = relationship(
        "SocialMedia",
        back_populates="content",
        cascade="all, delete-orphan",
        order_by="SocialMedia.sort_order",
    )

    moderation_logs: Mapped[list[SocialModerationLog]] = relationship(
        "SocialModerationLog",
        back_populates="content",
        cascade="all, delete-orphan",
        order_by="SocialModerationLog.created_at.desc()",
    )
