from __future__ import annotations

from collections.abc import Iterable

from ..domain.enums import SocialPlatform
from ..domain.errors import UnsupportedPlatformError
from .base import SocialProvider


class ProviderRegistry:
    def __init__(self, providers: Iterable[SocialProvider] = ()) -> None:
        self._providers: dict[SocialPlatform, SocialProvider] = {}

        for provider in providers:
            self.register(provider)

    def register(self, provider: SocialProvider) -> None:
        if provider.platform in self._providers:
            raise ValueError(
                f"Provider already registered: {provider.platform}"
            )

        self._providers[provider.platform] = provider

    def get(self, platform: SocialPlatform | str) -> SocialProvider:
        if isinstance(platform, str):
            try:
                platform = SocialPlatform(platform)
            except Exception as exc:
                raise UnsupportedPlatformError(
                    f"No provider registered for: {platform}"
                ) from exc

        try:
            return self._providers[platform]
        except KeyError as exc:
            raise UnsupportedPlatformError(
                f"No provider registered for: {platform}"
            ) from exc

    def supports(self, platform: SocialPlatform | str) -> bool:
        if isinstance(platform, str):
            try:
                platform = SocialPlatform(platform)
            except Exception:
                return False
        return platform in self._providers

    def list_supported(self) -> list[SocialPlatform]:
        return list(self._providers.keys())

    @classmethod
    def default(cls) -> ProviderRegistry:
        from .adapters.instagram_adapter import InstagramAdapter
        from .adapters.youtube_adapter import YouTubeAdapter

        return cls([YouTubeAdapter(), InstagramAdapter()])


__all__ = ["ProviderRegistry"]
