from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.modules.social.domain.enums import SocialContentStatus
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.source.validator import SourceValidator

if TYPE_CHECKING:
    from app.modules.social.models.social_content import SocialContent


class SourceResolver:
    SOURCE_UNAVAILABLE_FALLBACK = "SOURCE_UNAVAILABLE"

    def __init__(self, validator: type[SourceValidator] = SourceValidator) -> None:
        self.validator = validator

    def resolve(self, content: Any) -> str:
        # Check if explicitly marked unavailable or private or deleted
        status_val = str(getattr(content, "publication_status", "") or getattr(content, "status", "") or "").lower()
        if status_val in (
            SocialContentStatus.SOURCE_UNAVAILABLE.value,
            SocialContentStatus.SOURCE_DELETED.value,
            SocialContentStatus.SOURCE_PRIVATE.value,
            "source_unavailable",
            "source_deleted",
            "source_private",
        ):
            return self.SOURCE_UNAVAILABLE_FALLBACK

        source_url = getattr(content, "source_url", None)
        if not source_url or not str(source_url).strip():
            return self.SOURCE_UNAVAILABLE_FALLBACK

        try:
            validated = self.validator.validate_url(str(source_url))
            return validated.value
        except SourceUrlError:
            return self.SOURCE_UNAVAILABLE_FALLBACK

    def is_available(self, content: Any) -> bool:
        return self.resolve(content) != self.SOURCE_UNAVAILABLE_FALLBACK
