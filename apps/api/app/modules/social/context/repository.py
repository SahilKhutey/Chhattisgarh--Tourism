from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy import delete, desc, select
from sqlalchemy.orm import Session

from app.modules.social.models.context import SocialContentContext


class SocialContentContextRepository:
    """Repository for SocialContentContext persistence operations."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.db = session

    def attach_context(
        self,
        content_id: uuid.UUID,
        context_type: str,
        context_id: str,
        source: str = "admin",
        confidence: float = 1.0,
        metadata_json: dict[str, Any] | None = None,
    ) -> SocialContentContext:
        context = SocialContentContext(
            social_content_id=content_id,
            context_type=context_type,
            context_id=context_id,
            source=source,
            confidence=confidence,
            metadata_json=metadata_json or {},
        )
        self.session.add(context)
        self.session.flush()
        return context

    def get_contexts_for_content(self, content_id: uuid.UUID) -> Sequence[SocialContentContext]:
        stmt = (
            select(SocialContentContext)
            .where(SocialContentContext.social_content_id == content_id)
            .order_by(desc(SocialContentContext.confidence), SocialContentContext.created_at.asc())
        )
        return list(self.session.scalars(stmt).all())

    def get_contents_by_context(
        self,
        context_type: str,
        context_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[uuid.UUID]:
        stmt = (
            select(SocialContentContext.social_content_id)
            .where(
                SocialContentContext.context_type == context_type,
                SocialContentContext.context_id == context_id,
            )
            .order_by(desc(SocialContentContext.confidence))
            .limit(limit)
            .offset(offset)
        )
        return list(self.session.scalars(stmt).all())

    def remove_contexts_for_content(
        self,
        content_id: uuid.UUID,
        context_type: str | None = None,
    ) -> int:
        stmt = delete(SocialContentContext).where(SocialContentContext.social_content_id == content_id)
        if context_type:
            stmt = stmt.where(SocialContentContext.context_type == context_type)
        result = self.session.execute(stmt)
        self.session.flush()
        return result.rowcount or 0


ContextRepository = SocialContentContextRepository

__all__ = ["SocialContentContextRepository", "ContextRepository"]
