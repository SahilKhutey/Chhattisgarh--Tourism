from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session

from app.events.publisher import create_outbox_event
from app.modules.social.models.interactions import (
    SocialComment,
    SocialShare,
    SocialTripAdd,
)
from app.modules.social.repositories.interaction_repository import InteractionRepository
from app.modules.social.repositories.social_content_repository import (
    SocialContentRepository,
)
from app.modules.social.schemas.content_schemas import (
    AddToTripRequest,
    AddToTripResponse,
)
from app.modules.social.schemas.interaction_schemas import (
    CommentCreateRequest,
    CommentResponse,
    LikeResponse,
    SaveResponse,
    ShareRequest,
    ShareResponse,
)
from app.modules.social.services.social_content_service import (
    ContentNotFoundError,
)


class InteractionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.content_repo = SocialContentRepository(db)
        self.interaction_repo = InteractionRepository(db)

    def toggle_like(self, content_id: UUID, user_id: UUID) -> LikeResponse:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))

        liked = self.interaction_repo.toggle_like(content_id, user_id)
        delta = 1 if liked else -1
        self.content_repo.increment_likes(content_id, delta)

        create_outbox_event(
            self.db,
            event_type="SOCIAL_INTERACTION_LIKE" if liked else "SOCIAL_INTERACTION_UNLIKE",
            aggregate_id=content_id,
            payload={"content_id": str(content_id), "user_id": str(user_id)},
        )
        self.db.commit()

        updated = self.content_repo.get_by_id(content_id)
        return LikeResponse(
            content_id=content_id,
            liked=liked,
            likes_count=updated.likes_count if updated else 0,
        )

    def toggle_save(self, content_id: UUID, user_id: UUID, collection: str = "Default") -> SaveResponse:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))

        saved = self.interaction_repo.toggle_save(content_id, user_id, collection)
        delta = 1 if saved else -1
        self.content_repo.increment_saves(content_id, delta)

        create_outbox_event(
            self.db,
            event_type="SOCIAL_INTERACTION_SAVE" if saved else "SOCIAL_INTERACTION_UNSAVE",
            aggregate_id=content_id,
            payload={"content_id": str(content_id), "user_id": str(user_id), "collection": collection},
        )
        self.db.commit()

        updated = self.content_repo.get_by_id(content_id)
        return SaveResponse(
            content_id=content_id,
            saved=saved,
            saves_count=updated.saves_count if updated else 0,
        )

    def add_comment(self, content_id: UUID, user_id: UUID, req: CommentCreateRequest) -> CommentResponse:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))

        comment = SocialComment(
            content_id=content_id,
            user_id=user_id,
            parent_id=req.parent_id,
            comment_text=req.comment_text.strip(),
        )
        saved = self.interaction_repo.add_comment(comment)
        self.content_repo.increment_comments(content_id, 1)

        create_outbox_event(
            self.db,
            event_type="SOCIAL_INTERACTION_COMMENT",
            aggregate_id=content_id,
            payload={"content_id": str(content_id), "comment_id": str(saved.id), "user_id": str(user_id)},
        )
        self.db.commit()
        return CommentResponse.model_validate(saved)

    def record_share(self, content_id: UUID, user_id: UUID | None, req: ShareRequest) -> ShareResponse:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))

        share = SocialShare(
            content_id=content_id,
            user_id=user_id,
            channel=req.channel.lower(),
        )
        self.interaction_repo.record_share(share)
        self.content_repo.increment_shares(content_id, 1)

        create_outbox_event(
            self.db,
            event_type="SOCIAL_INTERACTION_SHARE",
            aggregate_id=content_id,
            payload={"content_id": str(content_id), "channel": req.channel},
        )
        self.db.commit()

        updated = self.content_repo.get_by_id(content_id)
        share_url = f"https://unseen36garh.in/social/{content.slug}"
        return ShareResponse(
            content_id=content_id,
            shares_count=updated.shares_count if updated else 0,
            share_url=share_url,
        )

    def add_to_trip(self, content_id: UUID, user_id: UUID, req: AddToTripRequest) -> AddToTripResponse:
        """
        The critical differentiator: Connecting social content directly to trip planning.
        """
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))

        destination_slug = req.place_slug or content.place_slug
        trip_add = SocialTripAdd(
            content_id=content_id,
            user_id=user_id,
            trip_id=req.trip_id,
            place_slug=destination_slug,
        )
        self.interaction_repo.record_trip_add(trip_add)
        self.content_repo.increment_trip_adds(content_id, 1)

        # Emit high-value Outbox domain event for trip planning & intelligence
        create_outbox_event(
            self.db,
            event_type="SOCIAL_INTERACTION_TRIP_ADD",
            aggregate_id=content_id,
            payload={
                "content_id": str(content_id),
                "user_id": str(user_id),
                "trip_id": req.trip_id,
                "place_slug": destination_slug,
                "district_id": content.district_id,
                "creator_id": str(content.creator_id),
            },
        )
        self.db.commit()

        updated = self.content_repo.get_by_id(content_id)
        return AddToTripResponse(
            success=True,
            content_id=content_id,
            trip_id=req.trip_id,
            place_slug=destination_slug,
            trip_adds_count=updated.trip_adds_count if updated else 1,
            message="Destination successfully added to trip planner from social content.",
        )
