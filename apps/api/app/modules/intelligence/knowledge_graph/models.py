from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    JSON,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class GraphEntity(Base):
    __tablename__ = "graph_entities"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    entity_type: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    canonical_name: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )

    aliases: Mapped[list] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=list,
    )

    # Note: mapped to column "metadata" in DB while keeping attribute name safe
    extra_metadata: Mapped[dict] = mapped_column(
        "metadata",
        JSON_TYPE,
        nullable=False,
        default=dict,
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
            "entity_type",
            "slug",
            "locale",
            name="uq_graph_entity_type_slug_locale",
        ),
        Index(
            "idx_graph_entity_type",
            "entity_type",
        ),
        Index(
            "idx_graph_entity_slug",
            "slug",
        ),
    )


class GraphRelationship(Base):
    __tablename__ = "graph_relationships"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    source_entity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=False,
    )

    relationship_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    target_entity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=False,
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="CONTENT_FIELD",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "source_entity_id",
            "relationship_type",
            "target_entity_id",
            name="uq_graph_rel_source_type_target",
        ),
        Index(
            "idx_graph_rel_source",
            "source_entity_id",
        ),
        Index(
            "idx_graph_rel_target",
            "target_entity_id",
        ),
        Index(
            "idx_graph_rel_type",
            "relationship_type",
        ),
    )


class EntityAlias(Base):
    __tablename__ = "entity_aliases"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    entity_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey(
            "graph_entities.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    alias: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )

    normalized_alias: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
    )

    entity_type: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "locale",
            "normalized_alias",
            "entity_type",
            name="uq_entity_alias_locale_norm_type",
        ),
        Index(
            "idx_entity_alias_lookup",
            "locale",
            "normalized_alias",
        ),
    )
