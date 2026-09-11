from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

UUID_TYPE = PGUUID(as_uuid=True).with_variant(Uuid(as_uuid=True), "sqlite")
JSON_TYPE = JSONB().with_variant(JSON(), "sqlite")


class ContentTemplateModel(Base):
    __tablename__ = "content_templates"

    id: Mapped[UUID] = mapped_column(
        UUID_TYPE,
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    icon: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="DRAFT",
        index=True,
    )

    current_version: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    revision: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    groups: Mapped[list["TemplateGroupModel"]] = relationship(
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateGroupModel.display_order",
    )

    fields: Mapped[list["TemplateFieldModel"]] = relationship(
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateFieldModel.display_order",
    )


class TemplateGroupModel(Base):
    __tablename__ = "template_groups"

    id: Mapped[UUID] = mapped_column(
        UUID_TYPE,
        primary_key=True,
        default=uuid4,
    )

    template_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "content_templates.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    label: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    template: Mapped[ContentTemplateModel] = relationship(
        back_populates="groups",
    )


class TemplateFieldModel(Base):
    __tablename__ = "template_fields"

    id: Mapped[UUID] = mapped_column(
        UUID_TYPE,
        primary_key=True,
        default=uuid4,
    )

    template_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "content_templates.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    group_id: Mapped[UUID | None] = mapped_column(
        ForeignKey(
            "template_groups.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    label: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    help_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    translatable: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    config: Mapped[dict] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    template: Mapped[ContentTemplateModel] = relationship(
        back_populates="fields",
    )

    __table_args__ = (
        UniqueConstraint(
            "template_id",
            "key",
            name="uq_template_field_key",
        ),
    )
