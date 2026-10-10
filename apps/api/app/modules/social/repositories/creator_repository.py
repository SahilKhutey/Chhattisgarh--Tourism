from __future__ import annotations

from uuid import UUID
from sqlalchemy import case, func, select, update
from sqlalchemy.orm import Session

from app.modules.social.domain.enums import CreatorStatus
from app.modules.social.models.creator import Creator


class CreatorRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, creator: Creator) -> Creator:
        self.db.add(creator)
        self.db.flush()
        return creator

    def get_by_id(self, creator_id: UUID) -> Creator | None:
        stmt = select(Creator).where(Creator.id == creator_id)
        return self.db.scalar(stmt)

    def get_by_user_id(self, user_id: UUID) -> Creator | None:
        stmt = select(Creator).where(Creator.user_id == user_id)
        return self.db.scalar(stmt)

    def get_by_handle(self, handle: str) -> Creator | None:
        stmt = select(Creator).where(func.lower(Creator.handle) == handle.strip().lower())
        return self.db.scalar(stmt)

    def get_by_slug(self, slug: str) -> Creator | None:
        """Alias for get_by_handle as slug is a synonym for handle."""
        return self.get_by_handle(slug)

    def list_creators(
        self,
        district_id: str | None = None,
        verified_only: bool = False,
        status: CreatorStatus | None = CreatorStatus.VERIFIED,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Creator]:
        stmt = select(Creator)
        if district_id:
            stmt = stmt.where(Creator.district_id == district_id.lower())
        if verified_only:
            stmt = stmt.where(Creator.is_verified.is_(True))
        if status:
            stmt = stmt.where(Creator.status == status.value)
        stmt = stmt.order_by(Creator.followers_count.desc(), Creator.created_at.desc())
        stmt = stmt.offset(offset).limit(limit)
        return list(self.db.scalars(stmt).all())

    def update_followers_count(self, creator_id: UUID, delta: int) -> None:
        new_val = Creator.followers_count + delta
        stmt = (
            update(Creator)
            .where(Creator.id == creator_id)
            .values(followers_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()

    def update_following_count(self, user_creator_id: UUID, delta: int) -> None:
        new_val = Creator.following_count + delta
        stmt = (
            update(Creator)
            .where(Creator.id == user_creator_id)
            .values(following_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()

    def increment_posts_count(self, creator_id: UUID, delta: int = 1) -> None:
        new_val = Creator.posts_count + delta
        stmt = (
            update(Creator)
            .where(Creator.id == creator_id)
            .values(posts_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()


SocialCreatorRepository = CreatorRepository

__all__ = ["CreatorRepository", "SocialCreatorRepository"]
