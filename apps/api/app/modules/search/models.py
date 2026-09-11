from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

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
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# Dialect-agnostic JSON column that resolves to JSONB on PostgreSQL
JSON_TYPE = JSON().with_variant(JSONB, "postgresql")


class SearchDocument(Base):
    __tablename__ = "search_documents"

    __table_args__ = (
        UniqueConstraint(
            "content_entry_id",
            "locale",
            name="uq_search_document_entry_locale",
        ),
        Index(
            "idx_search_documents_slug",
            "slug",
        ),
        Index(
            "idx_search_documents_template",
            "template_id",
        ),
        Index(
            "idx_search_documents_content_type",
            "content_type",
        ),
        Index(
            "idx_search_documents_district",
            "district",
        ),
        Index(
            "idx_search_documents_locale",
            "locale",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    content_entry_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=False,
        index=True,
    )

    template_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=False,
    )

    template_version_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    searchable_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    content_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    district: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    categories: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=list,
    )

    tags: Mapped[list[str]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=list,
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    quality_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    popularity_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    is_published: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class TaxonomyTerm(Base):
    __tablename__ = "taxonomy_terms"

    __table_args__ = (
        UniqueConstraint(
            "locale",
            "slug",
            name="uq_taxonomy_term_locale_slug",
        ),
        Index(
            "idx_taxonomy_terms_type",
            "type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("taxonomy_terms.id", ondelete="CASCADE"),
        nullable=True,
    )

    slug: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="category",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )

    sort_order: Mapped[int] = mapped_column(
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


class SearchSynonym(Base):
    __tablename__ = "search_synonyms"

    __table_args__ = (
        Index(
            "idx_search_synonyms_term",
            "term",
        ),
        Index(
            "idx_search_synonyms_locale",
            "locale",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    term: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    synonym: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )

    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class SearchEvent(Base):
    __tablename__ = "search_events"

    __table_args__ = (
        Index(
            "idx_search_events_type",
            "event_type",
        ),
        Index(
            "idx_search_events_hash",
            "query_hash",
        ),
        Index(
            "idx_search_events_created_at",
            "created_at",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    query_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    query_text: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="",
    )

    locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="SEARCH_PERFORMED",
    )

    result_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    selected_result_id: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
    )

    filters: Mapped[dict[str, Any]] = mapped_column(
        JSON_TYPE,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
