from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class GlossaryTerm(Base):
    __tablename__ = "glossary_terms"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    key: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    definition: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    context: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    preferred: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    deprecated: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
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

    translations: Mapped[list[GlossaryTermLocale]] = relationship(
        "GlossaryTermLocale",
        cascade="all, delete-orphan",
        lazy="selectin",
        back_populates="term_rel",
    )


class GlossaryTermLocale(Base):
    __tablename__ = "glossary_term_locales"

    __table_args__ = (
        UniqueConstraint(
            "term_id",
            "locale_code",
            name="uq_glossary_term_locale",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    term_id: Mapped[int] = mapped_column(
        ForeignKey(
            "glossary_terms.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    locale_code: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        index=True,
    )

    term: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    synonyms: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    term_rel: Mapped[GlossaryTerm] = relationship(
        "GlossaryTerm",
        back_populates="translations",
    )
