from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.modules.social.models.social_content import SocialContent
from app.modules.social.repositories.social_content_repository import (
    SocialContentRepository as LegacySocialContentRepository,
)


class SocialContentRepository(LegacySocialContentRepository):
    """Repository for SocialContent persistence operations."""

    def get_by_provider_and_id(self, provider: str, provider_content_id: str) -> SocialContent | None:
        stmt = (
            select(SocialContent)
            .options(
                joinedload(SocialContent.creator),
                selectinload(SocialContent.media_items),
            )
            .where(
                SocialContent.provider == provider,
                SocialContent.provider_content_id == provider_content_id,
            )
        )
        return self.db.scalar(stmt)

    def list_by_account(
        self,
        account_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialContent]:
        stmt = (
            select(SocialContent)
            .where(SocialContent.social_account_id == account_id)
            .order_by(desc(SocialContent.published_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self.db.scalars(stmt).all())

    get_by_provider_content = get_by_provider_and_id

    def mark_source_deleted(self, content_id: uuid.UUID) -> SocialContent | None:
        """Preserves social content row while flagging source deletion."""
        from app.modules.social.domain.enums import ContentStatus, SocialContentStatus
        content = self.get_by_id(content_id)
        if content:
            content.publication_status = ContentStatus.ARCHIVED.value
            metadata = dict(content.metadata_json or {})
            metadata["source_status"] = SocialContentStatus.SOURCE_DELETED.value
            content.metadata_json = metadata
            self.db.flush()
        return content

    def mark_source_unavailable(self, content_id: uuid.UUID) -> SocialContent | None:
        """Preserves social content row while flagging source unavailability."""
        from app.modules.social.domain.enums import ContentStatus, SocialContentStatus
        content = self.get_by_id(content_id)
        if content:
            content.publication_status = ContentStatus.ARCHIVED.value
            metadata = dict(content.metadata_json or {})
            metadata["source_status"] = SocialContentStatus.SOURCE_UNAVAILABLE.value
            content.metadata_json = metadata
            self.db.flush()
        return content

    def delete(self, content_id: uuid.UUID) -> bool:
        content = self.get_by_id(content_id)
        if content:
            self.db.delete(content)
            self.db.flush()
            return True
        return False


__all__ = ["SocialContentRepository"]
