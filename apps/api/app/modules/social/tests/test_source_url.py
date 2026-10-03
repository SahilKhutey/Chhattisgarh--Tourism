from __future__ import annotations

import pytest

from app.modules.social.domain.value_objects import SourceUrl


def test_source_url_accepts_https() -> None:
    source = SourceUrl("https://www.youtube.com/watch?v=abc")

    assert source.hostname == "www.youtube.com"


def test_source_url_normalizes_host() -> None:
    source = SourceUrl(
        "HTTPS://WWW.YOUTUBE.COM/watch?v=abc#section"
    )

    assert source.normalized() == (
        "https://www.youtube.com/watch?v=abc"
    )


def test_source_url_rejects_invalid_scheme() -> None:
    with pytest.raises(ValueError):
        SourceUrl("javascript:alert(1)")


def test_source_url_requires_hostname() -> None:
    with pytest.raises(ValueError):
        SourceUrl("https:///invalid")
