from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.modules.social.domain.enums import FeedLayoutType


class SocialFeedTemplate(Base):
    __tablename__ = "social_feed_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    slug: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(256),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    layout: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default=FeedLayoutType.STANDARD_GRID.value,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    platforms_allowed: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: ["YOUTUBE", "INSTAGRAM"],
    )
    content_types_allowed: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: ["REEL", "SHORT", "VIDEO", "POST"],
    )
    districts_allowed: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,  # empty means all districts
    )
    categories_allowed: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    place_slugs_allowed: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    max_items: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=12,
    )
    columns_desktop: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=4,
    )
    columns_tablet: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,
    )
    columns_mobile: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2,
    )
    show_creator_info: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    show_location: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    show_date: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    sort_strategy: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="LATEST",  # LATEST, POPULAR, TOURISM_PRIORITY
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
