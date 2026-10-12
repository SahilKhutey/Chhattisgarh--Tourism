from __future__ import annotations

import logging
import uuid
from dataclasses import asdict, dataclass
from typing import Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.modules.social.models.context import SocialContentContext
from app.modules.social.models.social_content import SocialContent

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SocialTourismContext:
    """
    Decoupled canonical tourism context resolution contract (Section 10.7).
    Keeps the Social Engine decoupled from the internal implementation details of the tourism graph.
    """

    district_id: str | None = None
    tourism_zone_id: str | None = None
    place_id: UUID | None = None
    place_slug: str | None = None
    place_name: str | None = None
    experience_id: str | None = None
    festival_id: str | None = None
    festival_name: str | None = None
    culture_id: str | None = None
    confidence: float = 1.0
    source: str = "direct"

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        if self.place_id:
            data["place_id"] = str(self.place_id)
        return data


class SocialTourismContextService:
    """
    Single integration boundary for resolving tourism context for social content items.
    Bridges direct SocialContent fields with secondary SocialContentContext entity links.
    """

    def __init__(self, session: Session) -> None:
        self.session = session

    def resolve_sync(self, content_id: UUID) -> SocialTourismContext:
        """Synchronously resolves canonical tourism context for a content item."""
        content = self.session.get(SocialContent, content_id)
        if not content:
            raise AppError(code="CONTENT_NOT_FOUND", message=f"Content '{content_id}' not found", status_code=404)

        # 1. Base values from canonical content columns
        district_id = content.district_id
        tourism_zone_id = content.tourism_zone_id
        place_id = content.place_id
        place_slug = content.place_slug
        place_name = content.place_name
        experience_id = content.experience_id
        festival_name = content.festival_name
        culture_id = None
        festival_id = None
        confidence = 1.0
        source = "content"

        # 2. Check for auxiliary context associations in social_content_context
        stmt = (
            select(SocialContentContext)
            .where(SocialContentContext.social_content_id == content_id)
        )
        contexts = list(self.session.scalars(stmt).all())

        for ctx in contexts:
            ctype = ctx.context_type.lower()
            if ctype == "district" and not district_id:
                district_id = ctx.context_id
            elif ctype == "tourism_zone" and not tourism_zone_id:
                tourism_zone_id = ctx.context_id
            elif ctype == "place" and not place_id:
                try:
                    place_id = uuid.UUID(ctx.context_id)
                except ValueError:
                    place_slug = ctx.context_id
            elif ctype == "experience" and not experience_id:
                experience_id = ctx.context_id
            elif ctype == "festival":
                festival_id = ctx.context_id
                if not festival_name:
                    festival_name = ctx.context_id.replace("-", " ").title()
            elif ctype == "culture":
                culture_id = ctx.context_id

        # 3. Fallback synthesis for place_name if place_slug exists
        if place_slug and not place_name:
            place_name = place_slug.replace("-", " ").title()

        return SocialTourismContext(
            district_id=district_id,
            tourism_zone_id=tourism_zone_id,
            place_id=place_id,
            place_slug=place_slug,
            place_name=place_name,
            experience_id=experience_id,
            festival_id=festival_id,
            festival_name=festival_name,
            culture_id=culture_id,
            confidence=confidence,
            source=source,
        )

    async def resolve(self, content_id: UUID) -> SocialTourismContext:
        """Asynchronously resolves canonical tourism context for a content item."""
        return self.resolve_sync(content_id)


__all__ = [
    "SocialTourismContext",
    "SocialTourismContextService",
]
