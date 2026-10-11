import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.handles.normalizer import (
    SocialHandle,
    SocialHandleNormalizer,
    normalize_handle,
)


def test_normalize_handle_basic():
    assert normalize_handle("cg_tourism") == "cg_tourism"
    assert normalize_handle("  cg_tourism  ") == "cg_tourism"
    assert normalize_handle("@cg_tourism") == "cg_tourism"
    assert normalize_handle("@@cg_tourism") == "cg_tourism"
    assert normalize_handle("/cg_tourism/") == "cg_tourism"
    assert normalize_handle("CG_Tourism") == "cg_tourism"


def test_normalize_handle_empty_rejection():
    with pytest.raises(ValueError, match="cannot be empty"):
        normalize_handle("")

    with pytest.raises(ValueError, match="cannot be empty"):
        normalize_handle("   ")

    with pytest.raises(ValueError, match="cannot be empty"):
        normalize_handle("@")

    with pytest.raises(ValueError, match="cannot be empty"):
        normalize_handle("///")


def test_social_handle_normalizer_platform_aware():
    handle = SocialHandleNormalizer.normalize(SocialPlatform.YOUTUBE, " @BastarVibes/ ")
    assert handle.platform == SocialPlatform.YOUTUBE
    assert handle.raw_handle == " @BastarVibes/ "
    assert handle.normalized_handle == "bastarvibes"
    assert str(handle) == "@bastarvibes"

    handle_ig = SocialHandleNormalizer.normalize("instagram", "RaviBastar")
    assert handle_ig.platform == SocialPlatform.INSTAGRAM
    assert handle_ig.normalized_handle == "ravibastar"
