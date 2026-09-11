from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.database import Base


class TemplateVersion(Base):
    __tablename__ = "template_versions"

    __table_args__ = (
        UniqueConstraint(
            "template_id",
            "version_number",
            name="uq_template_version_number",
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
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    version_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    icon: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    schema_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    breaking_change: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    risk_summary: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    created_by: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    fields: Mapped[list["TemplateVersionField"]] = relationship(
        back_populates="version",
        cascade="all, delete-orphan",
        order_by="TemplateVersionField.order",
    )


class TemplateVersionField(Base):
    __tablename__ = "template_version_fields"

    __table_args__ = (
        UniqueConstraint(
            "version_id",
            "key",
            name="uq_template_version_field_key",
        ),
        UniqueConstraint(
            "version_id",
            "order",
            name="uq_template_version_field_order",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "template_versions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    key: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    label: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    translatable: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    group: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    help_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    config: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    version: Mapped["TemplateVersion"] = relationship(
        back_populates="fields",
    )

    @property
    def field_type(self) -> str:
        return self.type

    @field_type.setter
    def field_type(self, val: str) -> None:
        self.type = val

    @property
    def group_name(self) -> str | None:
        return self.group

    @group_name.setter
    def group_name(self, val: str | None) -> None:
        self.group = val
