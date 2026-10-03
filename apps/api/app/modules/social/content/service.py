from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_media import SocialMedia
from app.modules.social.services.social_content_service import ContentNotFoundError


class SocialContentService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.content_repo = SocialContentRepository(session)

    def get_by_id(self, content_id: uuid.UUID) -> SocialContent:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))
        return content

    def get_by_slug(self, slug: str) -> SocialContent:
        content = self.content_repo.get_by_slug(slug)
        if not content:
            raise ContentNotFoundError(slug)
        return content

    def upsert_synced_content(self, content: SocialContent) -> tuple[SocialContent, bool]:
        """Upserts synced content by (provider, provider_content_id) preventing duplicates."""
        existing = None
        if content.provider and content.provider_content_id:
            existing = self.content_repo.get_by_provider_and_id(
                provider=content.provider,
                provider_content_id=content.provider_content_id,
            )

        now = datetime.now(timezone.utc)
        if existing:
            # Update metrics and freshness
            existing.views_count = max(existing.views_count, content.views_count)
            existing.likes_count = max(existing.likes_count, content.likes_count)
            existing.comments_count = max(existing.comments_count, content.comments_count)
            existing.shares_count = max(existing.shares_count, content.shares_count)
            existing.thumbnail_url = content.thumbnail_url or existing.thumbnail_url
            existing.source_url = content.source_url or existing.source_url
            existing.synced_at = now
            self.session.flush()
            return existing, False

        # Otherwise create new record
        self.content_repo.create(content)

        if content.thumbnail_url:
            media_type = "VIDEO" if content.content_type in ["VIDEO", "SHORT", "REEL"] else "IMAGE"
            media = SocialMedia(
                content_id=content.id,
                media_type=media_type,
                media_url=content.thumbnail_url,
                thumbnail_url=content.thumbnail_url,
                aspect_ratio=content.aspect_ratio or "16:9",
                duration_seconds=content.duration_seconds,
                processing_status="READY",
            )
            self.session.add(media)
            self.session.flush()

        create_outbox_event(
            self.session,
            event_type=EventType.SOCIAL_CONTENT_SYNCED,
            aggregate_id=content.id,
            payload={
                "content_id": str(content.id),
                "account_id": str(content.social_account_id) if content.social_account_id else None,
                "creator_id": str(content.creator_id),
                "provider": content.provider,
                "provider_content_id": content.provider_content_id,
                "source_url": content.source_url,
            },
        )
        return content, True

    def list_by_account(
        self,
        account_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[SocialContent]:
        return self.content_repo.list_by_account(account_id, limit=limit, offset=offset)


__all__ = ["SocialContentService", "ContentNotFoundError"]
