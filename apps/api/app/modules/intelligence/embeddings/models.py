from __future__ import annotations

import os
from datetime import datetime, timezone
from uuid import UUID, uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

EMBEDDING_DIMENSION = int(os.environ.get("CG_EMBEDDING_DIMENSION", "1024"))


class EmbeddingModel(Base):
    __tablename__ = "embedding_models"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    model_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    model_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    dimension: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=EMBEDDING_DIMENSION,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="local",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class ContentEmbedding(Base):
    __tablename__ = "content_embeddings"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    content_entry_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "content_entries.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    model_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "embedding_models.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )

    embedding: Mapped[list[float]] = mapped_column(
        Vector(EMBEDDING_DIMENSION),
        nullable=False,
    )

    source_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    content_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="1.0",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "content_entry_id",
            "locale",
            "model_id",
            name="uq_content_embedding_entry_locale_model",
        ),
        Index(
            "idx_content_embedding_entry",
            "content_entry_id",
        ),
    )
