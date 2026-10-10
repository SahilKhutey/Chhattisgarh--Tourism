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
    text,
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
    from app.modules.social.models.context import SocialContentContext
    from app.modules.social.models.creator import Creator
    from app.modules.social.models.moderation import SocialModerationLog
    from app.modules.social.models.social_account import SocialAccount
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
        Index(
            "uq_social_content_provider_identity",
            "provider",
            "provider_content_id",
            unique=True,
            postgresql_where=text("provider_content_id IS NOT NULL"),
            sqlite_where=text("provider_content_id IS NOT NULL"),
        ),
        Index("idx_social_content_feed", "publication_status", "visibility", "created_at"),
        Index("idx_social_content_region", "publication_status", "district_id", "created_at"),
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

    social_account_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("social_accounts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    provider: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
        index=True,
    )

    provider_content_id: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
        index=True,
    )

    source_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    thumbnail_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    original_platform_action_label: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    aspect_ratio: Mapped[str | None] = mapped_column(
        String(16),
        nullable=True,
        default="16:9",
    )

    synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    metadata_json: Mapped[dict[str, Any]] = mapped_column(
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

    social_account: Mapped[SocialAccount | None] = relationship(
        "SocialAccount",
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

    contexts = relationship(
        "SocialContentContext",
        back_populates="social_content",
        cascade="all, delete-orphan",
    )

    @property
    def platform(self):
        from app.modules.social.domain.enums import SocialPlatform

        if not self.provider:
            return None
        try:
            return SocialPlatform(self.provider)
        except Exception:
            return None

    @platform.setter
    def platform(self, val: Any) -> None:
        self.provider = val.value if hasattr(val, "value") else str(val) if val else None

    @property
    def status(self) -> str:
        return self.publication_status

    @status.setter
    def status(self, val: str) -> None:
        self.publication_status = val

    @property
    def source_status(self) -> str:
        return (self.metadata_json or {}).get("source_status", "active")

    def to_domain(self):

        from app.modules.social.domain.enums import SocialPlatform
        from app.modules.social.domain.models import SocialContent as DomainSocialContent

        try:
            platform_val = SocialPlatform(self.provider) if self.provider else SocialPlatform.YOUTUBE
        except Exception:
            platform_val = SocialPlatform.YOUTUBE

        return DomainSocialContent(
            id=str(self.id),
            creator_id=str(self.creator_id),
            social_account_id=str(self.social_account_id) if self.social_account_id else "",
            platform=platform_val,
            provider_content_id=self.provider_content_id or "",
            content_type=self.content_type,
            title=self.title,
            description=self.description,
            source_url=self.source_url or "",
            thumbnail_url=self.thumbnail_url,
            published_at=self.published_at,
            synced_at=self.synced_at or self.created_at,
            status=self.publication_status,
            visibility=self.visibility,
            district_id=self.district_id,
            tourism_zone_id=self.tourism_zone_id,
            place_id=str(self.place_id) if self.place_id else None,
            language=self.language,
            hashtags=list(self.hashtags or []),
            tourism_tags=list(self.tourism_tags or []),
            cultural_tags=list(self.cultural_tags or []),
            metadata=dict(self.metadata_json) if getattr(self, "metadata_json", None) else {},
        )

    @classmethod
    def from_domain(cls, domain_content):
        return cls(
            id=uuid.UUID(domain_content.id) if isinstance(domain_content.id, str) else domain_content.id,
            creator_id=uuid.UUID(domain_content.creator_id) if isinstance(domain_content.creator_id, str) else domain_content.creator_id,
            social_account_id=uuid.UUID(domain_content.social_account_id) if domain_content.social_account_id else None,
            provider=domain_content.platform.value if hasattr(domain_content.platform, "value") else str(domain_content.platform),
            provider_content_id=domain_content.provider_content_id,
            content_type=domain_content.content_type,
            title=domain_content.title or "",
            caption=domain_content.description or "",
            description=domain_content.description,
            slug=f"{domain_content.platform.value if hasattr(domain_content.platform, 'value') else domain_content.platform}-{domain_content.provider_content_id[:32]}",
            source_url=domain_content.source_url,
            thumbnail_url=domain_content.thumbnail_url,
            published_at=domain_content.published_at,
            synced_at=domain_content.synced_at,
            publication_status=domain_content.status,
            visibility=domain_content.visibility,
            district_id=domain_content.district_id or "bastar",
            tourism_zone_id=domain_content.tourism_zone_id,
            place_id=uuid.UUID(domain_content.place_id) if domain_content.place_id else None,
            language=domain_content.language or "hi",
            hashtags=list(domain_content.hashtags or []),
            tourism_tags=list(domain_content.tourism_tags or []),
            cultural_tags=list(domain_content.cultural_tags or []),
            metadata_json=dict(domain_content.metadata) if domain_content.metadata else {},
        )
