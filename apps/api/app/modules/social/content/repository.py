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

    def upsert_provider_content(self, content: SocialContent) -> tuple[SocialContent, bool]:
        """
        Idempotently inserts new content or updates provider-owned fields of existing content.
        Strictly preserves all editorial-owned fields (Place, District, Tags, Moderation status, Cultural sensitivity).
        Returns (content, is_created).
        """
        existing = self.get_by_provider_and_id(content.provider, content.provider_content_id)
        if existing is None:
            self.create(content)
            return content, True

        # Update provider-owned fields
        existing.title = content.title
        existing.description = content.description
        existing.thumbnail_url = content.thumbnail_url
        existing.source_url = content.source_url
        existing.published_at = content.published_at
        existing.duration_seconds = content.duration_seconds
        existing.aspect_ratio = content.aspect_ratio
        existing.content_type = content.content_type
        existing.likes_count = content.likes_count
        existing.comments_count = content.comments_count
        existing.views_count = content.views_count

        # Merge metadata preserving existing editorial metadata
        merged_meta = dict(existing.metadata_json or {})
        merged_meta.update(content.metadata_json or {})
        existing.metadata_json = merged_meta

        # Only assign fallback district/tags if existing has none
        if not existing.district_id and content.district_id:
            existing.district_id = content.district_id
        if (not existing.tourism_tags) and content.tourism_tags:
            existing.tourism_tags = content.tourism_tags
        if (not existing.cultural_tags) and content.cultural_tags:
            existing.cultural_tags = content.cultural_tags

        self.db.flush()
        return existing, False

    def delete(self, content_id: uuid.UUID) -> bool:
        content = self.get_by_id(content_id)
        if content:
            self.db.delete(content)
            self.db.flush()
            return True
        return False


__all__ = ["SocialContentRepository"]
