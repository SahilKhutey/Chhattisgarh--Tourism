from __future__ import annotations

import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.providers.registry import ProviderRegistry


class FakeProvider:
    platform = SocialPlatform.YOUTUBE


def test_provider_can_be_registered() -> None:
    registry = ProviderRegistry()

    registry.register(FakeProvider())

    assert registry.supports(SocialPlatform.YOUTUBE)


def test_duplicate_provider_is_rejected() -> None:
    registry = ProviderRegistry()

    registry.register(FakeProvider())

    with pytest.raises(ValueError):
        registry.register(FakeProvider())


def test_unknown_provider_is_rejected() -> None:
    registry = ProviderRegistry()

    with pytest.raises(ValueError):
        registry.get(SocialPlatform.INSTAGRAM)
