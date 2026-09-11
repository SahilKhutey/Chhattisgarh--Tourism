from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AccessibilityAudit(Base):
    __tablename__ = "accessibility_audits"

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
        index=True,
    )

    locale_code: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )

    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    issues: Mapped[list[AccessibilityIssue]] = relationship(
        "AccessibilityIssue",
        cascade="all, delete-orphan",
        lazy="selectin",
        back_populates="audit_rel",
    )


class AccessibilityIssue(Base):
    __tablename__ = "accessibility_issues"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    audit_id: Mapped[int] = mapped_column(
        ForeignKey(
            "accessibility_audits.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    field_key: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    remediation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    audit_rel: Mapped[AccessibilityAudit] = relationship(
        "AccessibilityAudit",
        back_populates="issues",
    )
