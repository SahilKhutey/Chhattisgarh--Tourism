from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ContentEntry(Base):
    __tablename__ = "content_entries"

    __table_args__ = (
        UniqueConstraint(
            "template_id",
            "slug",
            name="uq_content_entry_template_slug",
        ),
        Index(
            "ix_content_entries_template_id",
            "template_id",
        ),
        Index(
            "ix_content_entries_template_version_id",
            "template_version_id",
        ),
        Index(
            "ix_content_entries_status",
            "status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "content_templates.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    template_version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "template_versions.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(220),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="DRAFT",
    )

    title: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
    )

    values: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    locale_values: Mapped[dict[str, dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    revision: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    created_by: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
    )

    updated_by: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    template = relationship(
        "ContentTemplate",
        foreign_keys=[template_id],
        lazy="joined",
    )

    template_version = relationship(
        "TemplateVersion",
        foreign_keys=[template_version_id],
        lazy="joined",
    )

    @property
    def data(self) -> dict[str, Any]:
        return self.values or {}
