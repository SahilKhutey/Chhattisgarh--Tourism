from __future__ import annotations

from uuid import UUID
from sqlalchemy import case, func, or_, select, update
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

    def list_creators(
        self,
        district_id: str | None = None,
        verified_only: bool = False,
        status: CreatorStatus | str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Creator]:
        stmt = select(Creator)
        if district_id:
            stmt = stmt.where(Creator.district_id == district_id.lower())
        if verified_only:
            stmt = stmt.where(Creator.is_verified.is_(True))
        if status:
            status_val = status.value if hasattr(status, "value") else str(status)
            stmt = stmt.where(Creator.status == status_val)
        stmt = stmt.order_by(Creator.followers_count.desc(), Creator.created_at.desc())
        stmt = stmt.offset(offset).limit(limit)
        return list(self.db.scalars(stmt).all())

    def search_creators(self, query: str, limit: int = 20) -> list[Creator]:
        pattern = f"%{query.strip().lower()}%"
        stmt = (
            select(Creator)
            .where(
                or_(
                    func.lower(Creator.handle).like(pattern),
                    func.lower(Creator.display_name).like(pattern),
                    func.lower(Creator.district_id).like(pattern),
                )
            )
            .order_by(Creator.followers_count.desc())
            .limit(limit)
        )
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

    def update_following_count(self, creator_id: UUID, delta: int) -> None:
        new_val = Creator.following_count + delta
        stmt = (
            update(Creator)
            .where(Creator.id == creator_id)
            .values(following_count=case((new_val < 0, 0), else_=new_val))
        )
        self.db.execute(stmt)
        self.db.flush()
