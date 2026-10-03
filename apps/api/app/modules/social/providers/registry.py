from __future__ import annotations

from collections.abc import Iterable

from ..domain.enums import SocialPlatform
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

    def get(self, platform: SocialPlatform) -> SocialProvider:
        try:
            return self._providers[platform]
        except KeyError as exc:
            raise ValueError(
                f"No provider registered for: {platform}"
            ) from exc

    def supports(self, platform: SocialPlatform) -> bool:
        return platform in self._providers
