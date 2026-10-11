from __future__ import annotations

from app.modules.social.domain.enums import ContentType, SocialContentType
from app.modules.social.providers.instagram.errors import ContentNormalizationError


class InstagramContentClassifier:
    """Classifies Instagram media types into canonical Social Engine content types."""

    def classify(
        self,
        *,
        media_type: str,
        media_product_type: str | None = None,
    ) -> SocialContentType:
        product = (media_product_type or "").upper()
        media = (media_type or "").upper()

        if product == "REELS":
            return SocialContentType.REEL

        if media == "VIDEO":
            return SocialContentType.VIDEO

        if media in {"IMAGE", "CAROUSEL_ALBUM"}:
            return SocialContentType.POST

        raise ContentNormalizationError(
            f"Unsupported Instagram media type: '{media_type}' (product: '{media_product_type}')."
        )

    def classify_domain(
        self,
        *,
        media_type: str,
        media_product_type: str | None = None,
    ) -> ContentType:
        st = self.classify(media_type=media_type, media_product_type=media_product_type)
        if st == SocialContentType.REEL:
            return ContentType.REEL
        if st == SocialContentType.VIDEO:
            return ContentType.VIDEO
        return ContentType.POST


__all__ = ["InstagramContentClassifier"]
