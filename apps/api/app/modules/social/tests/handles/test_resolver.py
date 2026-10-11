import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.handles.resolver import SocialHandleResolver


def test_resolve_raw_handle():
    plat, handle = SocialHandleResolver.resolve("@cg_tourism", default_platform=SocialPlatform.YOUTUBE)
    assert plat == SocialPlatform.YOUTUBE
    assert handle == "cg_tourism"

    plat, handle = SocialHandleResolver.resolve("bastar.explore", default_platform="instagram")
    assert plat == SocialPlatform.INSTAGRAM
    assert handle == "bastar.explore"


def test_resolve_raw_handle_missing_platform_fails():
    with pytest.raises(ValueError, match="Cannot determine social platform"):
        SocialHandleResolver.resolve("@cg_tourism")


def test_resolve_youtube_urls():
    plat, handle = SocialHandleResolver.resolve("https://www.youtube.com/@cgtourism")
    assert plat == SocialPlatform.YOUTUBE
    assert handle == "cgtourism"

    plat, handle = SocialHandleResolver.resolve("https://youtube.com/c/BastarVibes")
    assert plat == SocialPlatform.YOUTUBE
    assert handle == "bastarvibes"

    plat, handle = SocialHandleResolver.resolve("https://m.youtube.com/@tribal_culture?si=abc")
    assert plat == SocialPlatform.YOUTUBE
    assert handle == "tribal_culture"


def test_resolve_instagram_urls():
    plat, handle = SocialHandleResolver.resolve("https://www.instagram.com/cgtourism/")
    assert plat == SocialPlatform.INSTAGRAM
    assert handle == "cgtourism"

    plat, handle = SocialHandleResolver.resolve("https://instagram.com/bastar.art?igsh=xyz")
    assert plat == SocialPlatform.INSTAGRAM
    assert handle == "bastar.art"


def test_resolve_invalid_url():
    with pytest.raises(ValueError, match="Unsupported host"):
        SocialHandleResolver.resolve("https://twitter.com/cgtourism")

    with pytest.raises(ValueError, match="does not point to a creator profile"):
        SocialHandleResolver.resolve("https://instagram.com/p/Cxyz123/")
