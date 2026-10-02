from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.events.publisher import create_outbox_event
from app.modules.social.domain.enums import (
    ContentStatus,
    ContentType,
    ContentVisibility,
    CulturalSensitivityLevel,
    ModerationStatus,
)
from app.modules.social.domain.state_machines import (
    ContentStateMachine,
    calculate_content_expiration,
    validate_cultural_protection,
)
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_media import SocialMedia
from app.modules.social.repositories.creator_repository import CreatorRepository
from app.modules.social.repositories.social_content_repository import (
    SocialContentRepository,
)
from app.modules.social.schemas.content_schemas import (
    SocialContentCreateRequest,
    SocialContentUpdateRequest,
)


class ContentNotFoundError(AppError):
    def __init__(self, identifier: str) -> None:
        super().__init__(code="CONTENT_NOT_FOUND", message=f"Content '{identifier}' not found.", status_code=404)


def generate_unique_slug(title: str, creator_handle: str) -> str:
    clean_title = re.sub(r"[^a-zA-Z0-9\s-]", "", title.lower())
    slug_part = re.sub(r"[\s-]+", "-", clean_title).strip("-")[:100]
    short_uuid = uuid.uuid4().hex[:8]
    return f"{slug_part}-{creator_handle}-{short_uuid}"


class SocialContentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.content_repo = SocialContentRepository(db)
        self.creator_repo = CreatorRepository(db)

    def create_content(
        self,
        user_id: UUID,
        req: SocialContentCreateRequest,
        auto_submit: bool = False,
    ) -> SocialContent:
        # 1. Find creator profile for user
        creator = self.creator_repo.get_by_user_id(user_id)
        if not creator:
            raise AppError(
                code="CREATOR_PROFILE_REQUIRED",
                message="You must create a Creator profile before publishing social content.",
                status_code=403,
            )

        # 2. Cultural sensitivity check
        validate_cultural_protection(
            sensitivity=req.cultural_sensitivity,
            has_sacred_consent=req.has_sacred_consent,
            community_attribution=req.community_attribution,
        )

        # 3. Generate unique slug
        slug = generate_unique_slug(req.title, creator.handle)

        # 4. Status determination
        initial_status = ContentStatus.SUBMITTED if auto_submit else ContentStatus.DRAFT
        mod_status = ModerationStatus.PENDING if auto_submit else ModerationStatus.PENDING

        content = SocialContent(
            creator_id=creator.id,
            content_type=req.content_type.value,
            title=req.title.strip(),
            caption=req.caption.strip(),
            description=req.description.strip() if req.description else None,
            slug=slug,
            district_id=req.district_id.strip().lower(),
            tourism_zone_id=req.tourism_zone_id,
            place_id=req.place_id,
            place_slug=req.place_slug,
            route_id=req.route_id,
            experience_id=req.experience_id,
            festival_name=req.festival_name,
            latitude=req.latitude,
            longitude=req.longitude,
            template_id=req.template_id,
            template_version_id=req.template_version_id,
            template_payload=req.template_payload,
            cultural_tags=req.cultural_tags,
            tourism_tags=req.tourism_tags,
            hashtags=req.hashtags,
            language=req.language,
            cultural_sensitivity=req.cultural_sensitivity.value,
            license_type=req.license_type.value,
            source_attribution=req.source_attribution,
            community_attribution=req.community_attribution,
            has_sacred_consent=req.has_sacred_consent,
            visibility=req.visibility.value,
            moderation_status=mod_status.value,
            publication_status=initial_status.value,
            is_evergreen=req.is_evergreen,
        )

        # 5. Attach media items
        for idx, media_in in enumerate(req.media_items):
            media_item = SocialMedia(
                media_type=media_in.media_type,
                media_url=media_in.media_url,
                thumbnail_url=media_in.thumbnail_url,
                poster_url=media_in.poster_url,
                duration_seconds=media_in.duration_seconds,
                aspect_ratio=media_in.aspect_ratio,
                resolution=media_in.resolution,
                captions_url=media_in.captions_url,
                transcript=media_in.transcript,
                language=media_in.language,
                sort_order=media_in.sort_order or idx,
            )
            content.media_items.append(media_item)

        saved = self.content_repo.create(content)
        self.creator_repo.increment_posts_count(creator.id, 1)

        # 6. Outbox domain event
        create_outbox_event(
            self.db,
            event_type="SOCIAL_CONTENT_CREATED",
            aggregate_id=saved.id,
            payload={
                "content_id": str(saved.id),
                "creator_id": str(creator.id),
                "content_type": saved.content_type,
                "district_id": saved.district_id,
                "place_slug": saved.place_slug,
            },
        )

        if auto_submit:
            create_outbox_event(
                self.db,
                event_type="SOCIAL_CONTENT_SUBMITTED",
                aggregate_id=saved.id,
                payload={"content_id": str(saved.id), "creator_id": str(creator.id)},
            )

        self.db.commit()
        return self.get_by_id(saved.id)

    def get_by_id(self, content_id: UUID) -> SocialContent:
        content = self.content_repo.get_by_id(content_id)
        if not content:
            raise ContentNotFoundError(str(content_id))
        return content

    def get_by_slug(self, slug: str) -> SocialContent:
        content = self.content_repo.get_by_slug(slug)
        if not content:
            raise ContentNotFoundError(slug)
        return content

    def submit_for_moderation(self, content_id: UUID, user_id: UUID) -> SocialContent:
        content = self.get_by_id(content_id)
        creator = self.creator_repo.get_by_user_id(user_id)
        if not creator or content.creator_id != creator.id:
            raise AppError(code="NOT_CONTENT_OWNER", message="Only the author can submit this content.", status_code=403)

        current_status = ContentStatus(content.publication_status)
        ContentStateMachine.transition(current_status, ContentStatus.SUBMITTED)

        # Re-check cultural sensitivity before submission
        validate_cultural_protection(
            sensitivity=CulturalSensitivityLevel(content.cultural_sensitivity),
            has_sacred_consent=content.has_sacred_consent,
            community_attribution=content.community_attribution,
        )

        content.publication_status = ContentStatus.SUBMITTED.value
        content.moderation_status = ModerationStatus.UNDER_REVIEW.value

        create_outbox_event(
            self.db,
            event_type="SOCIAL_CONTENT_SUBMITTED",
            aggregate_id=content.id,
            payload={
                "content_id": str(content.id),
                "creator_id": str(content.creator_id),
                "district_id": content.district_id,
                "cultural_sensitivity": content.cultural_sensitivity,
            },
        )
        self.db.commit()
        return content

    def publish_content(self, content_id: UUID) -> SocialContent:
        """
        Publishes content once approved by moderation.
        Calculates 24-hour expiration if content is an ephemeral STORY and not marked evergreen.
        """
        content = self.get_by_id(content_id)
        if content.moderation_status != ModerationStatus.APPROVED.value:
            raise AppError(
                code="MODERATION_APPROVAL_REQUIRED",
                message=f"Cannot publish content with moderation status '{content.moderation_status}'. Must be APPROVED.",
                status_code=400,
            )

        current_status = ContentStatus(content.publication_status)
        ContentStateMachine.transition(current_status, ContentStatus.PUBLISHED)

        content.publication_status = ContentStatus.PUBLISHED.value
        content.published_at = datetime.now(timezone.utc)
        content.expires_at = calculate_content_expiration(
            ContentType(content.content_type),
            is_evergreen=content.is_evergreen,
        )

        create_outbox_event(
            self.db,
            event_type="SOCIAL_CONTENT_PUBLISHED",
            aggregate_id=content.id,
            payload={
                "content_id": str(content.id),
                "creator_id": str(content.creator_id),
                "content_type": content.content_type,
                "district_id": content.district_id,
                "place_slug": content.place_slug,
                "expires_at": content.expires_at.isoformat() if content.expires_at else None,
            },
        )
        self.db.commit()
        return content

    def make_story_evergreen(self, content_id: UUID, moderator_id: UUID) -> SocialContent:
        """
        Converts an ephemeral Story into evergreen permanent cultural content.
        """
        content = self.get_by_id(content_id)
        content.is_evergreen = True
        content.expires_at = None
        if content.publication_status == ContentStatus.EXPIRED.value:
            content.publication_status = ContentStatus.PUBLISHED.value

        create_outbox_event(
            self.db,
            event_type="SOCIAL_CONTENT_UPDATED",
            aggregate_id=content.id,
            payload={"content_id": str(content.id), "is_evergreen": True},
        )
        self.db.commit()
        return content
