from __future__ import annotations

from typing import Dict

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.providers.base import SocialProvider
from app.modules.social.providers.instagram_provider import InstagramProvider
from app.modules.social.providers.youtube_provider import YouTubeProvider


class ProviderFactory:
    _providers: Dict[SocialPlatform, SocialProvider] = {}

    @classmethod
    def get_provider(cls, platform: SocialPlatform) -> SocialProvider:
        if platform not in cls._providers:
            if platform == SocialPlatform.YOUTUBE:
                cls._providers[platform] = YouTubeProvider()
            elif platform == SocialPlatform.INSTAGRAM:
                cls._providers[platform] = InstagramProvider()
            else:
                raise ValueError(f"Unsupported social provider platform: {platform}")
        return cls._providers[platform]

    @classmethod
    def register_provider(cls, platform: SocialPlatform, provider: SocialProvider) -> None:
        cls._providers[platform] = provider
