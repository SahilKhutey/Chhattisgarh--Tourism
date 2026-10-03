from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.modules.social.models.social_feed_template import SocialFeedTemplate


class SocialFeedTemplateRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, template_id: uuid.UUID) -> SocialFeedTemplate | None:
        stmt = select(SocialFeedTemplate).where(SocialFeedTemplate.id == template_id)
        return self.session.scalar(stmt)

    def get_by_slug(self, slug: str) -> SocialFeedTemplate | None:
        stmt = select(SocialFeedTemplate).where(SocialFeedTemplate.slug == slug)
        return self.session.scalar(stmt)

    def list_templates(self, active_only: bool = False) -> Sequence[SocialFeedTemplate]:
        stmt = select(SocialFeedTemplate)
        if active_only:
            stmt = stmt.where(SocialFeedTemplate.is_active.is_(True))
        stmt = stmt.order_by(desc(SocialFeedTemplate.created_at))
        return list(self.session.scalars(stmt).all())

    def create(self, template: SocialFeedTemplate) -> SocialFeedTemplate:
        self.session.add(template)
        self.session.flush()
        return template
