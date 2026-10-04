import pytest
from app.modules.social.domain.enums import SocialPlatform
from app.modules.social.domain.errors import SourceUrlError
from app.modules.social.accounts.validator import SocialAccountValidator


def test_youtube_valid_hosts():
    validator = SocialAccountValidator()
    valid_urls = [
        "https://www.youtube.com/@cg_tourism",
        "https://youtube.com/@cg_tourism",
        "https://m.youtube.com/@cg_tourism",
    ]
    for url in valid_urls:
        validator.validate_url(platform=SocialPlatform.YOUTUBE, profile_url=url)


def test_instagram_valid_hosts():
    validator = SocialAccountValidator()
    valid_urls = [
        "https://www.instagram.com/cgtourism_official",
        "https://instagram.com/cgtourism_official",
    ]
    for url in valid_urls:
        validator.validate_url(platform=SocialPlatform.INSTAGRAM, profile_url=url)


def test_platform_host_mismatch():
    validator = SocialAccountValidator()
    # Passing an Instagram URL for YouTube
    with pytest.raises(ValueError, match="URL does not belong to youtube"):
        validator.validate_url(
            platform=SocialPlatform.YOUTUBE,
            profile_url="https://www.instagram.com/cg_tourism",
        )

    # Passing a YouTube URL for Instagram
    with pytest.raises(ValueError, match="URL does not belong to instagram"):
        validator.validate_url(
            platform=SocialPlatform.INSTAGRAM,
            profile_url="https://www.youtube.com/@cg_tourism",
        )


def test_unauthorized_external_hosts():
    validator = SocialAccountValidator()
    fake_urls = [
        "https://evil-youtube.com/@cg_tourism",
        "https://youtube.com.attacker.com/@cg_tourism",
        "https://google.com",
    ]
    for url in fake_urls:
        with pytest.raises(ValueError):
            validator.validate_url(platform=SocialPlatform.YOUTUBE, profile_url=url)


def test_invalid_scheme_rejected():
    validator = SocialAccountValidator()
    with pytest.raises(SourceUrlError):
        validator.validate_url(
            platform=SocialPlatform.YOUTUBE,
            profile_url="ftp://youtube.com/@cg_tourism",
        )


def test_handle_validation():
    validator = SocialAccountValidator()

    # Valid handles
    assert validator.validate_handle("@cg_explorer") == "cg_explorer"
    assert validator.validate_handle("bastar.traveler") == "bastar.traveler"
    assert validator.validate_handle("durg-culture") == "durg-culture"

    # Empty handle
    with pytest.raises(ValueError, match="cannot be empty"):
        validator.validate_handle("   ")
    with pytest.raises(ValueError, match="cannot be empty"):
        validator.validate_handle("@")

    # Invalid characters
    with pytest.raises(ValueError, match="invalid characters"):
        validator.validate_handle("cg explorer with spaces")
    with pytest.raises(ValueError, match="invalid characters"):
        validator.validate_handle("cg!explorer$")


def test_handle_extraction():
    validator = SocialAccountValidator()

    yt_handle = validator.extract_handle(
        SocialPlatform.YOUTUBE,
        "https://www.youtube.com/@bastar_tribal_life",
    )
    assert yt_handle == "bastar_tribal_life"

    ig_handle = validator.extract_handle(
        SocialPlatform.INSTAGRAM,
        "https://www.instagram.com/chhattisgarh_diaries/",
    )
    assert ig_handle == "chhattisgarh_diaries"
