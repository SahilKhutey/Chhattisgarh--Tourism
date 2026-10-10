from __future__ import annotations

import pytest

from app.modules.social.providers.youtube.parser import (
    clean_handle,
    duration_to_seconds,
    parse_youtube_profile,
    youtube_channel_url,
    youtube_video_url,
)


def test_clean_handle():
    assert clean_handle("@RaviBastar") == "RaviBastar"
    assert clean_handle("  @BastarTravels  ") == "BastarTravels"
    assert clean_handle("DantewadaTrails") == "DantewadaTrails"


def test_parse_youtube_profile_handles():
    assert parse_youtube_profile("@RaviBastar") == ("handle", "RaviBastar")
    assert parse_youtube_profile("https://www.youtube.com/@RaviBastar") == ("handle", "RaviBastar")
    assert parse_youtube_profile("https://youtube.com/@CG_Tourism_Official") == ("handle", "CG_Tourism_Official")
    assert parse_youtube_profile("youtube.com/@KangerValley") == ("handle", "KangerValley")
    assert parse_youtube_profile("SimpleHandle") == ("handle", "SimpleHandle")


def test_parse_youtube_profile_channel_ids():
    channel_id = "UC1234567890123456789012"
    assert parse_youtube_profile(channel_id) == ("channel_id", channel_id)
    assert parse_youtube_profile(f"https://www.youtube.com/channel/{channel_id}") == ("channel_id", channel_id)
    assert parse_youtube_profile(f"https://youtube.com/channel/{channel_id}") == ("channel_id", channel_id)


def test_parse_youtube_profile_custom_and_user():
    assert parse_youtube_profile("https://www.youtube.com/c/CGTourismOfficial") == ("custom", "CGTourismOfficial")
    assert parse_youtube_profile("https://www.youtube.com/user/LegacyUserCG") == ("user", "LegacyUserCG")


def test_parse_youtube_profile_empty_raises():
    with pytest.raises(ValueError):
        parse_youtube_profile("")
    with pytest.raises(ValueError):
        parse_youtube_profile("   ")


def test_duration_to_seconds():
    assert duration_to_seconds("PT30S") == 30
    assert duration_to_seconds("PT2M10S") == 130
    assert duration_to_seconds("PT1H2M10S") == 3730
    assert duration_to_seconds("PT1H") == 3600
    assert duration_to_seconds("PT5M") == 300
    assert duration_to_seconds("PT0S") == 0
    assert duration_to_seconds("") == 0


def test_invalid_duration_raises():
    with pytest.raises(ValueError):
        duration_to_seconds("15:30")
    with pytest.raises(ValueError):
        duration_to_seconds("INVALID")


def test_canonical_urls():
    assert youtube_video_url("vid123") == "https://www.youtube.com/watch?v=vid123"
    assert youtube_channel_url("UC123") == "https://www.youtube.com/channel/UC123"
