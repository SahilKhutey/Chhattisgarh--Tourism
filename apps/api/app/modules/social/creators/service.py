from __future__ import annotations

import re
import uuid
from uuid import UUID
from typing import Any

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.events.types import EventType
from app.modules.social.creators.duplicate import CreatorDuplicateService
from app.modules.social.creators.repository import CreatorRepository
from app.modules.social.creators.schemas import CreatorCreate, CreatorUpdate
from app.modules.social.creators.validator import CreatorValidator, ValidationResult
from app.modules.social.domain.enums import CreatorStatus
from app.modules.social.domain.state_machines import CreatorStateMachine
from app.modules.social.models.creator import Creator


class CreatorNotFoundError(AppError):
    def __init__(self, identifier: str) -> None:
        super().__init__(code="CREATOR_NOT_FOUND", message=f"Creator '{identifier}' not found.", status_code=404)


class HandleAlreadyExistsError(AppError):
    def __init__(self, handle: str) -> None:
        super().__init__(code="HANDLE_ALREADY_EXISTS", message=f"Creator handle '@{handle}' is already registered.", status_code=409)


class CreatorValidationError(AppError):
    def __init__(self, message: str, details: Any = None) -> None:
        super().__init__(code="CREATOR_VALIDATION_FAILED", message=message, status_code=422)
        self.details = details


class CreatorService:
    def __init__(
        self,
        db_or_repo: Session | CreatorRepository,
        validator: CreatorValidator | None = None,
    ) -> None:
        if isinstance(db_or_repo, Session):
            self.db = db_or_repo
            self.creator_repo = CreatorRepository(db_or_repo)
            self.repository = self.creator_repo
        else:
            self.repository = db_or_repo
            self.creator_repo = db_or_repo
            self.db = getattr(db_or_repo, "db", None)

        self.validator = validator or CreatorValidator()
        self.duplicate_service = CreatorDuplicateService(self.creator_repo)

    def _normalize_handle(self, handle: str) -> str:
        return re.sub(r"^@", "", handle.strip()).lower()

    def validate_creator(
        self,
        *,
        display_name: str,
        slug: str,
        bio: str | None = None,
        district_id: UUID | str | None = None,
        tourism_zone_id: UUID | str | None = None,
    ) -> ValidationResult:
        return self.validator.validate(
            display_name=display_name,
            slug=slug,
            bio=bio,
            district_id=district_id,
            tourism_zone_id=tourism_zone_id,
        )

    def find_duplicate_candidates(
        self,
        *,
        display_name: str,
        district_id: Any = None,
        min_confidence: float = 0.6,
    ) -> dict[str, list[dict[str, Any]]]:
        return self.duplicate_service.find_candidates_sync(
            display_name=display_name,
            district_id=district_id,
            min_confidence=min_confidence,
        )

    def create_creator(
        self,
        data: CreatorCreate,
        actor: Any = None,
        auto_verify: bool = False,
    ) -> Creator:
        normalized_handle = self._normalize_handle(data.handle)

        # Validate structured rules
        validation = self.validate_creator(
            display_name=data.display_name,
            slug=normalized_handle,
            bio=data.bio,
            district_id=data.district_id,
            tourism_zone_id=None,
        )
        if not validation.valid:
            issue = validation.issues[0]
            raise CreatorValidationError(message=issue.message, details=validation.issues)

        if self.creator_repo.get_by_handle(normalized_handle):
            raise HandleAlreadyExistsError(normalized_handle)

        status = CreatorStatus.VERIFIED.value if auto_verify else CreatorStatus.PENDING.value
        creator = Creator(
            handle=normalized_handle,
            display_name=data.display_name.strip(),
            bio=data.bio.strip() if data.bio else None,
            avatar_url=data.avatar_url,
            district_id=data.district_id.strip().lower() if data.district_id else "bastar",
            languages=data.languages,
            categories=data.categories,
            status=status,
            is_verified=auto_verify,
        )
        saved = self.creator_repo.create(creator)

        if self.db:
            create_outbox_event(
                self.db,
                event_type="CREATOR_CREATED",
                aggregate_id=saved.id,
                payload={
                    "creator_id": str(saved.id),
                    "handle": saved.handle,
                    "district_id": saved.district_id,
                },
            )
            self.db.commit()
        return saved

    def get_creator(self, creator_id: UUID) -> Creator:
        creator = self.creator_repo.get_by_id(creator_id)
        if not creator:
            raise CreatorNotFoundError(str(creator_id))
        return creator

    def get_by_handle(self, handle: str) -> Creator:
        normalized = self._normalize_handle(handle)
        creator = self.creator_repo.get_by_handle(normalized)
        if not creator:
            raise CreatorNotFoundError(f"@{handle}")
        return creator

    def update_creator(
        self,
        creator_id: UUID,
        data: CreatorUpdate,
        actor: Any = None,
    ) -> Creator:
        creator = self.get_creator(creator_id)
        if data.display_name is not None:
            creator.display_name = data.display_name.strip()
        if data.bio is not None:
            creator.bio = data.bio.strip()
        if data.avatar_url is not None:
            creator.avatar_url = data.avatar_url
        if data.district_id is not None:
            creator.district_id = data.district_id.strip().lower()
        if data.languages is not None:
            creator.languages = data.languages
        if data.categories is not None:
            creator.categories = data.categories

        if self.db:
            create_outbox_event(
                self.db,
                event_type="CREATOR_UPDATED",
                aggregate_id=creator.id,
                payload={"creator_id": str(creator.id), "handle": creator.handle},
            )
            self.db.commit()
        return creator

    def archive_creator(self, creator_id: UUID, actor: Any = None) -> Creator:
        creator = self.get_creator(creator_id)
        creator.status = "SUSPENDED"
        if self.db:
            create_outbox_event(
                self.db,
                event_type="CREATOR_ARCHIVED",
                aggregate_id=creator.id,
                payload={"creator_id": str(creator.id), "handle": creator.handle},
            )
            self.db.commit()
        return creator

    def activate_creator(self, creator_id: UUID, actor: Any = None) -> Creator:
        creator = self.get_creator(creator_id)
        creator.status = CreatorStatus.ACTIVE.value
        if self.db:
            create_outbox_event(
                self.db,
                event_type="CREATOR_ACTIVATED",
                aggregate_id=creator.id,
                payload={"creator_id": str(creator.id), "handle": creator.handle},
            )
            self.db.commit()
        return creator

    def verify_creator(self, creator_id: UUID, is_verified: bool = True, actor: Any = None) -> Creator:
        creator = self.get_creator(creator_id)
        current_status = CreatorStatus(creator.status) if creator.status in CreatorStatus.__members__ or creator.status in [c.value for c in CreatorStatus] else CreatorStatus.PENDING
        target_status = CreatorStatus.VERIFIED if is_verified else CreatorStatus.PENDING

        CreatorStateMachine.transition(current_status, target_status)
        creator.status = target_status.value
        creator.is_verified = is_verified

        if self.db:
            create_outbox_event(
                self.db,
                event_type=EventType.CREATOR_VERIFIED if is_verified else EventType.CREATOR_UNVERIFIED,
                aggregate_id=creator.id,
                payload={"creator_id": str(creator.id), "handle": creator.handle, "is_verified": is_verified},
            )
            self.db.commit()
        return creator

    def list_creators(
        self,
        district_id: str | None = None,
        verified_only: bool = False,
        status: CreatorStatus | str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Creator]:
        return self.creator_repo.list_creators(
            district_id=district_id,
            verified_only=verified_only,
            status=status,
            limit=limit,
            offset=offset,
        )

    def search_creators(self, query: str, limit: int = 20) -> list[Creator]:
        return self.creator_repo.search_creators(query=query, limit=limit)


__all__ = [
    "CreatorService",
    "CreatorNotFoundError",
    "HandleAlreadyExistsError",
    "CreatorValidationError",
]
