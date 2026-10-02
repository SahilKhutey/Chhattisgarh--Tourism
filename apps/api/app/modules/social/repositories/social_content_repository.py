from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import case, desc, or_, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    FeedType,
    ModerationStatus,
)
from app.modules.social.models.creator import Creator
from app.modules.social.models.moderation import SocialModerationLog
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_media import SocialMedia


class SocialContentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, content: SocialContent) -> SocialContent:
        self.db.add(content)
        self.db.flush()
        return content

    def get_by_id(self, content_id: UUID) -> SocialContent | None:
        stmt = (
            select(SocialContent)
            .options(
                joinedload(SocialContent.creator),
                selectinload(SocialContent.media_items),
                selectinload(SocialContent.moderation_logs),
            )
            .where(SocialContent.id == content_id)
        )
        return self.db.scalar(stmt)

    def get_by_slug(self, slug: str) -> SocialContent | None:
        stmt = (
            select(SocialContent)
            .options(
                joinedload(SocialContent.creator),
                selectinload(SocialContent.media_items),
            )
            .where(SocialContent.slug == slug)
        )
        return self.db.scalar(stmt)

    def list_feed(
        self,
        feed_type: FeedType = FeedType.HOME,
        district_id: str | None = None,
        content_type: ContentType | None = None,
        cultural_tag: str | None = None,
        place_slug: str | None = None,
        limit: int = 30,
        offset: int = 0,
    ) -> list[SocialContent]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(SocialContent)
            .options(
                joinedload(SocialContent.creator),
                selectinload(SocialContent.media_items),
            )
            .where(
                SocialContent.publication_status == ContentStatus.PUBLISHED.value,
                SocialContent.visibility == ContentVisibility.PUBLIC.value,
                or_(
                    SocialContent.expires_at.is_(None),
                    SocialContent.expires_at > now,
                    SocialContent.is_evergreen.is_(True),
                ),
            )
        )

        if district_id:
            stmt = stmt.where(SocialContent.district_id == district_id.lower())

        if content_type:
            stmt = stmt.where(SocialContent.content_type == content_type.value)

        if place_slug:
            stmt = stmt.where(SocialContent.place_slug == place_slug)

        # Order by popularity / engagement / recency
        stmt = stmt.order_by(
            desc(
                SocialContent.trip_adds_count * 5
                + SocialContent.likes_count * 2
                + SocialContent.shares_count * 3
            ),
            SocialContent.published_at.desc(),
        )
        stmt = stmt.offset(offset).limit(limit)
        results = list(self.db.scalars(stmt).all())

        if feed_type == FeedType.CULTURE:
            # Filter in Python for cross-dialect safety (JSON arrays in sqlite vs postgres)
            results = [
                c
                for c in results
                if c.content_type == ContentType.CULTURAL_STORY.value
                or (c.cultural_tags and len(c.cultural_tags) > 0)
            ]

        return results

    def list_pending_moderation(self, limit: int = 50, offset: int = 0) -> list[SocialContent]:
        stmt = (
            select(SocialContent)
            .options(
                joinedload(SocialContent.creator),
                selectinload(SocialContent.media_items),
            )
            .where(
                SocialContent.moderation_status.in_(
                    [
                        ModerationStatus.PENDING.value,
                        ModerationStatus.UNDER_REVIEW.value,
                        ModerationStatus.ESCALATED_CULTURAL_COMMITTEE.value,
                    ]
                )
            )
            .order_by(SocialContent.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def add_moderation_log(self, log: SocialModerationLog) -> SocialModerationLog:
        self.db.add(log)
        self.db.flush()
        return log

    def increment_likes(self, content_id: UUID, delta: int) -> None:
        new_val = SocialContent.likes_count + delta
        stmt = (
            update(SocialContent)
            .where(SocialContent.id == content_id)
            .values(likes_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()

    def increment_saves(self, content_id: UUID, delta: int) -> None:
        new_val = SocialContent.saves_count + delta
        stmt = (
            update(SocialContent)
            .where(SocialContent.id == content_id)
            .values(saves_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()

    def increment_comments(self, content_id: UUID, delta: int = 1) -> None:
        new_val = SocialContent.comments_count + delta
        stmt = (
            update(SocialContent)
            .where(SocialContent.id == content_id)
            .values(comments_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()

    def increment_shares(self, content_id: UUID, delta: int = 1) -> None:
        new_val = SocialContent.shares_count + delta
        stmt = (
            update(SocialContent)
            .where(SocialContent.id == content_id)
            .values(shares_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()

    def increment_trip_adds(self, content_id: UUID, delta: int = 1) -> None:
        new_val = SocialContent.trip_adds_count + delta
        stmt = (
            update(SocialContent)
            .where(SocialContent.id == content_id)
            .values(trip_adds_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()
