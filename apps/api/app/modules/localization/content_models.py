from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TemplateLocalization(Base):
    __tablename__ = "template_localizations"

    __table_args__ = (
        UniqueConstraint(
            "template_id",
            "locale_code",
            name="uq_template_localization_locale",
        ),
        Index(
            "ix_template_localizations_template_id",
            "template_id",
        ),
        Index(
            "ix_template_localizations_locale_code",
            "locale_code",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "content_templates.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    locale_code: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )

    name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="DRAFT",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class ContentLocalization(Base):
    __tablename__ = "content_localizations"

    __table_args__ = (
        UniqueConstraint(
            "content_entry_id",
            "locale_code",
            "field_key",
            name="uq_content_localization_field",
        ),
        Index(
            "ix_content_localizations_entry_id",
            "content_entry_id",
        ),
        Index(
            "ix_content_localizations_locale_code",
            "locale_code",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    content_entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "content_entries.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    locale_code: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )

    field_key: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="DRAFT",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
