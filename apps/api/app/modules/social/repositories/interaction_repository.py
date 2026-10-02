from __future__ import annotations

from uuid import UUID
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.modules.social.models.interactions import (
    CreatorFollow,
    SocialComment,
    SocialLike,
    SocialSave,
    SocialShare,
    SocialTripAdd,
)


class InteractionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def toggle_like(self, content_id: UUID, user_id: UUID) -> bool:
        stmt = select(SocialLike).where(
            SocialLike.content_id == content_id,
            SocialLike.user_id == user_id,
        )
        existing = self.db.scalar(stmt)
        if existing:
            self.db.delete(existing)
            self.db.flush()
            return False
        else:
            new_like = SocialLike(content_id=content_id, user_id=user_id)
            self.db.add(new_like)
            self.db.flush()
            return True

    def is_liked(self, content_id: UUID, user_id: UUID) -> bool:
        stmt = select(func.count(SocialLike.id)).where(
            SocialLike.content_id == content_id,
            SocialLike.user_id == user_id,
        )
        return bool(self.db.scalar(stmt))

    def toggle_save(self, content_id: UUID, user_id: UUID, collection_name: str = "Default") -> bool:
        stmt = select(SocialSave).where(
            SocialSave.content_id == content_id,
            SocialSave.user_id == user_id,
        )
        existing = self.db.scalar(stmt)
        if existing:
            self.db.delete(existing)
            self.db.flush()
            return False
        else:
            new_save = SocialSave(
                content_id=content_id,
                user_id=user_id,
                collection_name=collection_name,
            )
            self.db.add(new_save)
            self.db.flush()
            return True

    def is_saved(self, content_id: UUID, user_id: UUID) -> bool:
        stmt = select(func.count(SocialSave.id)).where(
            SocialSave.content_id == content_id,
            SocialSave.user_id == user_id,
        )
        return bool(self.db.scalar(stmt))

    def add_comment(self, comment: SocialComment) -> SocialComment:
        self.db.add(comment)
        self.db.flush()
        return comment

    def list_comments(self, content_id: UUID, limit: int = 50, offset: int = 0) -> list[SocialComment]:
        stmt = (
            select(SocialComment)
            .where(
                SocialComment.content_id == content_id,
                SocialComment.status == "VISIBLE",
            )
            .order_by(SocialComment.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def record_share(self, share: SocialShare) -> SocialShare:
        self.db.add(share)
        self.db.flush()
        return share

    def record_trip_add(self, trip_add: SocialTripAdd) -> SocialTripAdd:
        self.db.add(trip_add)
        self.db.flush()
        return trip_add

    def toggle_follow(self, creator_id: UUID, follower_user_id: UUID) -> bool:
        stmt = select(CreatorFollow).where(
            CreatorFollow.creator_id == creator_id,
            CreatorFollow.follower_user_id == follower_user_id,
        )
        existing = self.db.scalar(stmt)
        if existing:
            self.db.delete(existing)
            self.db.flush()
            return False
        else:
            new_follow = CreatorFollow(
                creator_id=creator_id,
                follower_user_id=follower_user_id,
            )
            self.db.add(new_follow)
            self.db.flush()
            return True

    def is_following(self, creator_id: UUID, follower_user_id: UUID) -> bool:
        stmt = select(func.count(CreatorFollow.id)).where(
            CreatorFollow.creator_id == creator_id,
            CreatorFollow.follower_user_id == follower_user_id,
        )
        return bool(self.db.scalar(stmt))
