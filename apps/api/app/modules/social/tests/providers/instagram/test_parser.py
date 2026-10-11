from __future__ import annotations

import pytest

from app.modules.social.providers.instagram.parser import (
    instagram_permalink,
    instagram_profile_url,
    parse_instagram_profile,
)


def test_parse_instagram_profile_direct_handles():
    assert parse_instagram_profile("@cg_tourism") == "cg_tourism"
    assert parse_instagram_profile("  @bastar.travels  ") == "bastar.travels"
    assert parse_instagram_profile("unseen_36garh") == "unseen_36garh"
    assert parse_instagram_profile("BastarExplorer") == "bastarexplorer"


def test_parse_instagram_profile_urls():
    assert parse_instagram_profile("https://www.instagram.com/bastar_travels/") == "bastar_travels"
    assert parse_instagram_profile("http://instagram.com/chitrakote_waterfall") == "chitrakote_waterfall"
    assert parse_instagram_profile("https://m.instagram.com/cg_culture") == "cg_culture"
    assert parse_instagram_profile("https://www.instagram.com/@bastar_trails/") == "bastar_trails"


def test_parse_instagram_profile_invalid_empty():
    with pytest.raises(ValueError, match="cannot be empty"):
        parse_instagram_profile("")
    with pytest.raises(ValueError, match="cannot be empty"):
        parse_instagram_profile("   ")


def test_parse_instagram_profile_invalid_domain():
    with pytest.raises(ValueError, match="not an Instagram profile"):
        parse_instagram_profile("https://twitter.com/bastar")
    with pytest.raises(ValueError, match="not an Instagram profile"):
        parse_instagram_profile("https://facebook.com/bastar")


def test_parse_instagram_profile_invalid_scheme():
    with pytest.raises(ValueError, match="must use HTTP or HTTPS"):
        parse_instagram_profile("ftp://instagram.com/bastar")


def test_parse_instagram_profile_missing_path():
    with pytest.raises(ValueError, match="username is missing"):
        parse_instagram_profile("https://www.instagram.com/")


def test_parse_instagram_profile_invalid_characters():
    with pytest.raises(ValueError, match="Invalid Instagram"):
        parse_instagram_profile("bad handle with spaces")
    with pytest.raises(ValueError, match="Invalid Instagram"):
        parse_instagram_profile("user$name!")


def test_instagram_profile_url():
    assert instagram_profile_url("@bastar_travels") == "https://www.instagram.com/bastar_travels/"
    assert instagram_profile_url("cg_tourism") == "https://www.instagram.com/cg_tourism/"


def test_instagram_permalink():
    assert instagram_permalink("Cx98124_abc", is_reel=False) == "https://www.instagram.com/p/Cx98124_abc/"
    assert instagram_permalink("Cx98124_abc", is_reel=True) == "https://www.instagram.com/reel/Cx98124_abc/"
