import pytest

from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.handles.validator import SocialHandleValidator


def test_youtube_handle_validation():
    # Valid handles
    assert SocialHandleValidator.validate(SocialPlatform.YOUTUBE, "cg_tourism") == "cg_tourism"
    assert SocialHandleValidator.validate(SocialPlatform.YOUTUBE, "@Bastar-Travel.99") == "bastar-travel.99"
    assert SocialHandleValidator.validate(SocialPlatform.YOUTUBE, "abc") == "abc"

    # Too short (< 3)
    with pytest.raises(ValueError, match="between 3 and 30 characters"):
        SocialHandleValidator.validate(SocialPlatform.YOUTUBE, "ab")

    # Too long (> 30)
    with pytest.raises(ValueError, match="between 3 and 30 characters"):
        SocialHandleValidator.validate(SocialPlatform.YOUTUBE, "a" * 31)

    # Invalid characters (e.g. spaces, symbols)
    with pytest.raises(ValueError, match="Invalid YouTube handle syntax"):
        SocialHandleValidator.validate(SocialPlatform.YOUTUBE, "bastar!vibes")


def test_instagram_handle_validation():
    # Valid handles
    assert SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, "cg_tourism") == "cg_tourism"
    assert SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, "bastar.vibes") == "bastar.vibes"
    assert SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, "a") == "a"

    # Cannot start with dot
    with pytest.raises(ValueError, match="cannot start with a period"):
        SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, ".bastarvibes")

    # Cannot end with dot
    with pytest.raises(ValueError, match="cannot end with a period"):
        SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, "bastarvibes.")

    # No consecutive dots
    with pytest.raises(ValueError, match="consecutive periods"):
        SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, "bastar..vibes")

    # Invalid characters (hyphens not allowed in IG usernames)
    with pytest.raises(ValueError, match="Invalid Instagram handle syntax"):
        SocialHandleValidator.validate(SocialPlatform.INSTAGRAM, "bastar-vibes")
