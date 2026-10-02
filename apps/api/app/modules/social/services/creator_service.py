from __future__ import annotations

import re
import uuid
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.modules.social.domain.enums import CreatorStatus
from app.modules.social.domain.state_machines import CreatorStateMachine
from app.modules.social.models.creator import Creator
from app.modules.social.repositories.creator_repository import CreatorRepository
from app.modules.social.repositories.interaction_repository import InteractionRepository
from app.modules.social.schemas.creator_schemas import (
    CreatorRegisterRequest,
    CreatorResponse,
    CreatorUpdateRequest,
)


class HandleAlreadyExistsError(AppError):
    def __init__(self, handle: str) -> None:
        super().__init__(code="HANDLE_ALREADY_EXISTS", message=f"Creator handle '@{handle}' is already registered.", status_code=409)


class CreatorNotFoundError(AppError):
    def __init__(self, identifier: str) -> None:
        super().__init__(code="CREATOR_NOT_FOUND", message=f"Creator '{identifier}' not found.", status_code=404)


class CreatorService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.creator_repo = CreatorRepository(db)
        self.interaction_repo = InteractionRepository(db)

    def register_creator(self, user_id: UUID, req: CreatorRegisterRequest, auto_verify: bool = False) -> Creator:
        # Check if user already has a creator profile
        existing_user_creator = self.creator_repo.get_by_user_id(user_id)
        if existing_user_creator:
            raise AppError(code="CREATOR_ALREADY_EXISTS", message="User already has a creator profile.", status_code=409)

        # Check handle uniqueness
        normalized_handle = re.sub(r"^@", "", req.handle.strip()).lower()
        if self.creator_repo.get_by_handle(normalized_handle):
            raise HandleAlreadyExistsError(normalized_handle)

        status = CreatorStatus.VERIFIED.value if auto_verify else CreatorStatus.PENDING.value
        creator = Creator(
            user_id=user_id,
            handle=normalized_handle,
            display_name=req.display_name.strip(),
            bio=req.bio.strip() if req.bio else None,
            avatar_url=req.avatar_url,
            district_id=req.district_id.strip().lower(),
            languages=req.languages,
            categories=req.categories,
            status=status,
            is_verified=auto_verify,
        )
        saved = self.creator_repo.create(creator)

        # Record outbox event if verified
        if auto_verify:
            create_outbox_event(
                self.db,
                event_type="CREATOR_VERIFIED",
                aggregate_id=saved.id,
                payload={"creator_id": str(saved.id), "handle": saved.handle, "district_id": saved.district_id},
            )

        self.db.commit()
        return saved

    def get_by_id(self, creator_id: UUID) -> Creator:
        creator = self.creator_repo.get_by_id(creator_id)
        if not creator:
            raise CreatorNotFoundError(str(creator_id))
        return creator

    def get_by_user_id(self, user_id: UUID) -> Creator:
        creator = self.creator_repo.get_by_user_id(user_id)
        if not creator:
            raise CreatorNotFoundError(f"User {user_id}")
        return creator

    def get_by_handle(self, handle: str) -> Creator:
        normalized = re.sub(r"^@", "", handle.strip()).lower()
        creator = self.creator_repo.get_by_handle(normalized)
        if not creator:
            raise CreatorNotFoundError(f"@{handle}")
        return creator

    def list_creators(
        self,
        district_id: str | None = None,
        verified_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Creator]:
        return self.creator_repo.list_creators(
            district_id=district_id,
            verified_only=verified_only,
            limit=limit,
            offset=offset,
        )

    def update_profile(self, user_id: UUID, req: CreatorUpdateRequest) -> Creator:
        creator = self.get_by_user_id(user_id)
        if req.display_name is not None:
            creator.display_name = req.display_name.strip()
        if req.bio is not None:
            creator.bio = req.bio.strip()
        if req.avatar_url is not None:
            creator.avatar_url = req.avatar_url
        if req.district_id is not None:
            creator.district_id = req.district_id.strip().lower()
        if req.languages is not None:
            creator.languages = req.languages
        if req.categories is not None:
            creator.categories = req.categories
        if req.featured_work_id is not None:
            creator.featured_work_id = req.featured_work_id

        self.db.commit()
        return creator

    def set_verification(self, creator_id: UUID, is_verified: bool) -> Creator:
        creator = self.get_by_id(creator_id)
        current_status = CreatorStatus(creator.status)
        target_status = CreatorStatus.VERIFIED if is_verified else CreatorStatus.PENDING
        
        CreatorStateMachine.transition(current_status, target_status)
        creator.status = target_status.value
        creator.is_verified = is_verified

        create_outbox_event(
            self.db,
            event_type="CREATOR_VERIFIED" if is_verified else "CREATOR_UNVERIFIED",
            aggregate_id=creator.id,
            payload={"creator_id": str(creator.id), "handle": creator.handle, "is_verified": is_verified},
        )
        self.db.commit()
        return creator

    def toggle_follow(self, creator_id: UUID, follower_user_id: UUID) -> tuple[bool, int]:
        creator = self.get_by_id(creator_id)
        if creator.user_id == follower_user_id:
            raise AppError(code="CANNOT_FOLLOW_SELF", message="Creators cannot follow themselves.", status_code=400)

        followed = self.interaction_repo.toggle_follow(creator_id, follower_user_id)
        delta = 1 if followed else -1
        self.creator_repo.update_followers_count(creator_id, delta)

        # If follower is also a creator, update their following count
        follower_creator = self.creator_repo.get_by_user_id(follower_user_id)
        if follower_creator:
            self.creator_repo.update_following_count(follower_creator.id, delta)

        self.db.commit()
        updated_creator = self.get_by_id(creator_id)
        return followed, updated_creator.followers_count
