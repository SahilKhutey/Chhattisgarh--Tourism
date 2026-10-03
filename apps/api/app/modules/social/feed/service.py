from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy.orm import Session

from app.modules.social.content.repository import SocialContentRepository
from app.modules.social.domain.enums import FeedType
from app.modules.social.feed.policy import FeedPolicy, is_feed_eligible
from app.modules.social.feed.query import FeedQuery
from app.modules.social.models.social_content import SocialContent
from app.modules.social.schemas.content_schemas import (
    FeedCardResponse,
    MediaItemResponse,
)
from app.modules.social.schemas.creator_schemas import CreatorSummaryResponse
from app.modules.social.source.resolver import SourceResolver


class SocialFeedService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.content_repo = SocialContentRepository(session)
        self.source_resolver = SourceResolver()

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

        resolved_source = self.source_resolver.resolve(content)

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
        creator_counts: dict[uuid.UUID, int] = defaultdict(int)
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

        diverse_items.extend(deferred_items)
        return diverse_items

    def get_feed(self, query: FeedQuery) -> list[FeedCardResponse]:
        limit = query.limit
        offset = query.offset

        candidates = self.content_repo.list_feed(
            feed_type=query.feed_type,
            district_id=query.district_id,
            content_type=query.content_type,
            cultural_tag=query.cultural_tag,
            place_slug=query.place_slug,
            limit=limit * 2 if query.enable_diversity else limit,
            offset=offset,
        )

        # Filter strictly by feed policy
        eligible = [c for c in candidates if is_feed_eligible(c)]

        if query.enable_diversity and query.feed_type in (FeedType.HOME, FeedType.EXPLORE):
            results = self._apply_anti_monopoly_diversity(eligible)[:limit]
        else:
            results = eligible[:limit]

        return [self._to_card(c) for c in results]

    def resolve_source_url(self, content_id: uuid.UUID) -> str:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            return SourceResolver.SOURCE_UNAVAILABLE_FALLBACK
        return self.source_resolver.resolve(content)


__all__ = ["SocialFeedService"]
