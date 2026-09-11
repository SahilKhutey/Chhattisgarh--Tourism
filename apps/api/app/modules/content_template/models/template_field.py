import uuid
from datetime import datetime

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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TemplateField(Base):
    __tablename__ = "template_fields"

    __table_args__ = (
        UniqueConstraint(
            "template_id",
            "key",
            name="uq_template_field_key",
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

    key: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    label: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
    )

    field_type: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
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

    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    group_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    help_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    config: Mapped[dict] = mapped_column(
        JSON,
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

    template = relationship(
        "ContentTemplate",
        back_populates="fields",
    )
