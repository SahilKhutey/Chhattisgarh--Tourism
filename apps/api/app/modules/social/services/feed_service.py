from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.modules.social.domain.enums import ContentType, FeedType
from app.modules.social.models.social_content import SocialContent
from app.modules.social.repositories.social_content_repository import (
    SocialContentRepository,
)
from app.modules.social.schemas.content_schemas import (
    FeedCardResponse,
    MediaItemResponse,
)
from app.modules.social.schemas.creator_schemas import CreatorSummaryResponse


class FeedService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.content_repo = SocialContentRepository(db)

    def _to_card(self, content: SocialContent) -> FeedCardResponse:
        creator_summary = (
            CreatorSummaryResponse(
                id=content.creator.id,
                handle=content.creator.handle,
                display_name=content.creator.display_name,
                avatar_url=content.creator.avatar_url,
                district_id=content.creator.district_id,
                is_verified=content.creator.is_verified,
            )
            if content.creator
            else CreatorSummaryResponse(
                id=content.creator_id,
                handle="unknown",
                display_name="Local Creator",
                district_id=content.district_id,
                is_verified=False,
            )
        )

        primary_media = None
        if content.media_items:
            first_media = content.media_items[0]
            primary_media = MediaItemResponse.model_validate(first_media)

        now = datetime.now(timezone.utc)
        is_expired = bool(
            content.expires_at and content.expires_at <= now and not content.is_evergreen
        )

        return FeedCardResponse(
            id=content.id,
            creator=creator_summary,
            content_type=content.content_type,
            title=content.title,
            caption=content.caption,
            slug=content.slug,
            district_id=content.district_id,
            place_slug=content.place_slug,
            festival_name=content.festival_name,
            cultural_tags=content.cultural_tags or [],
            tourism_tags=content.tourism_tags or [],
            primary_media=primary_media,
            media_count=len(content.media_items),
            likes_count=content.likes_count,
            comments_count=content.comments_count,
            trip_adds_count=content.trip_adds_count,
            shares_count=content.shares_count,
            published_at=content.published_at,
            expires_at=content.expires_at,
            is_story_expired=is_expired,
        )

    def _apply_anti_monopoly_diversity(
        self,
        items: list[SocialContent],
        max_per_creator: int = 2,
        max_per_district: int = 4,
    ) -> list[SocialContent]:
        """
        Anti-monopoly diversity interleaving:
        Prevents a single viral creator or dominant district from taking over the feed.
        """
        creator_counts: dict[UUID, int] = defaultdict(int)
        district_counts: dict[str, int] = defaultdict(int)
        diverse_items: list[SocialContent] = []
        deferred_items: list[SocialContent] = []

        for item in items:
            c_count = creator_counts[item.creator_id]
            d_count = district_counts[item.district_id.lower()]

            if c_count < max_per_creator and d_count < max_per_district:
                diverse_items.append(item)
                creator_counts[item.creator_id] += 1
                district_counts[item.district_id.lower()] += 1
            else:
                deferred_items.append(item)

        # Append deferred items at the tail of the page to preserve total volume
        diverse_items.extend(deferred_items)
        return diverse_items

    def get_feed(
        self,
        feed_type: FeedType = FeedType.HOME,
        district_id: str | None = None,
        content_type: ContentType | None = None,
        place_slug: str | None = None,
        limit: int = 30,
        offset: int = 0,
        enable_diversity: bool = True,
    ) -> list[FeedCardResponse]:
        # Fetch candidate items from repository
        candidates = self.content_repo.list_feed(
            feed_type=feed_type,
            district_id=district_id,
            content_type=content_type,
            place_slug=place_slug,
            limit=limit * 2 if enable_diversity else limit,  # overfetch for diversity window
            offset=offset,
        )

        if enable_diversity and feed_type in (FeedType.HOME, FeedType.EXPLORE):
            candidates = self._apply_anti_monopoly_diversity(candidates)[:limit]
        else:
            candidates = candidates[:limit]

        return [self._to_card(c) for c in candidates]
