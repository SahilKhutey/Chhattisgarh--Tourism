from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.modules.social.domain.enums import ContentStatus, ModerationStatus
from app.modules.social.models.social_content import SocialContent
from app.modules.social.models.social_feed_template import SocialFeedTemplate
from app.modules.social.repositories.social_feed_template_repository import (
    SocialFeedTemplateRepository,
)
from app.modules.social.schemas.content_schemas import FeedCardResponse
from app.modules.social.schemas.template_schemas import FeedTemplateCreate


class FeedTemplateService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.template_repo = SocialFeedTemplateRepository(session)

    def create_or_update_template(self, payload: FeedTemplateCreate) -> SocialFeedTemplate:
        existing = self.template_repo.get_by_slug(payload.slug)
        if existing:
            existing.name = payload.name
            existing.description = payload.description
            existing.layout = payload.layout.value
            existing.platforms_allowed = payload.platforms_allowed
            existing.content_types_allowed = payload.content_types_allowed
            existing.districts_allowed = payload.districts_allowed
            existing.categories_allowed = payload.categories_allowed
            existing.place_slugs_allowed = payload.place_slugs_allowed
            existing.max_items = payload.max_items
            existing.columns_desktop = payload.columns_desktop
            existing.columns_tablet = payload.columns_tablet
            existing.columns_mobile = payload.columns_mobile
            existing.show_creator_info = payload.show_creator_info
            existing.show_location = payload.show_location
            existing.show_date = payload.show_date
            existing.sort_strategy = payload.sort_strategy
            template = existing
        else:
            template = SocialFeedTemplate(
                slug=payload.slug,
                name=payload.name,
                description=payload.description,
                layout=payload.layout.value,
                platforms_allowed=payload.platforms_allowed,
                content_types_allowed=payload.content_types_allowed,
                districts_allowed=payload.districts_allowed,
                categories_allowed=payload.categories_allowed,
                place_slugs_allowed=payload.place_slugs_allowed,
                max_items=payload.max_items,
                columns_desktop=payload.columns_desktop,
                columns_tablet=payload.columns_tablet,
                columns_mobile=payload.columns_mobile,
                show_creator_info=payload.show_creator_info,
                show_location=payload.show_location,
                show_date=payload.show_date,
                sort_strategy=payload.sort_strategy,
            )
            self.template_repo.create(template)

        self.session.commit()
        return template

    def list_templates(self, active_only: bool = False) -> Sequence[SocialFeedTemplate]:
        return self.template_repo.list_templates(active_only=active_only)

    def get_template_by_slug(self, slug: str) -> SocialFeedTemplate | None:
        return self.template_repo.get_by_slug(slug)

    def render_template(
        self,
        slug: str,
        district: str | None = None,
        limit: int | None = None,
    ) -> dict[str, Any]:
        template = self.template_repo.get_by_slug(slug)
        if not template:
            # Fallback default configuration if template not registered yet
            template = SocialFeedTemplate(
                slug=slug,
                name=slug.replace("-", " ").title(),
                layout="STANDARD_GRID",
                platforms_allowed=["YOUTUBE", "INSTAGRAM"],
                content_types_allowed=["REEL", "SHORT", "VIDEO", "POST"],
                districts_allowed=[],
                categories_allowed=[],
                place_slugs_allowed=[],
                max_items=12,
                columns_desktop=4,
                columns_tablet=3,
                columns_mobile=2,
            )

        stmt = (
            select(SocialContent)
            .where(
                SocialContent.publication_status == ContentStatus.PUBLISHED.value,
                SocialContent.moderation_status == ModerationStatus.APPROVED.value,
            )
            .options(
                selectinload(SocialContent.creator),
                selectinload(SocialContent.media_items),
            )
        )

        # 1. Platform rule
        if template.platforms_allowed:
            stmt = stmt.where(SocialContent.provider.in_(template.platforms_allowed))

        # 2. Content types rule
        if template.content_types_allowed:
            stmt = stmt.where(SocialContent.content_type.in_(template.content_types_allowed))

        # 3. District filter
        target_district = district or (template.districts_allowed[0] if template.districts_allowed else None)
        if target_district:
            stmt = stmt.where(SocialContent.district_id == target_district.lower())

        # 4. Sorting & limit
        if template.sort_strategy == "POPULAR":
            stmt = stmt.order_by(desc(SocialContent.views_count), desc(SocialContent.likes_count))
        else:
            stmt = stmt.order_by(desc(SocialContent.published_at), desc(SocialContent.created_at))

        max_fetch = min(limit or template.max_items, 100)
        stmt = stmt.limit(max_fetch)

        contents = self.session.scalars(stmt).all()

        cards = [FeedCardResponse.model_validate(c) for c in contents]

        return {
            "template": {
                "slug": template.slug,
                "name": template.name,
                "layout": template.layout,
                "columns": {
                    "desktop": template.columns_desktop,
                    "tablet": template.columns_tablet,
                    "mobile": template.columns_mobile,
                },
                "show_creator_info": template.show_creator_info,
                "show_location": template.show_location,
                "show_date": template.show_date,
            },
            "items": cards,
            "total_items": len(cards),
        }
