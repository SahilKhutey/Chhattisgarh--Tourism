from __future__ import annotations

import pytest

from app.modules.social.domain.enums import ContentType, SocialContentType
from app.modules.social.providers.youtube.classifier import YouTubeContentClassifier


def test_classifier_under_180s_default_is_short():
    classifier = YouTubeContentClassifier(max_short_duration_seconds=180)
    assert classifier.classify(duration_seconds=60) == SocialContentType.SHORT
    assert classifier.classify(duration_seconds=180) == SocialContentType.SHORT
    assert classifier.classify_domain(duration_seconds=60) == ContentType.SHORT


def test_classifier_over_180s_is_video():
    classifier = YouTubeContentClassifier(max_short_duration_seconds=180)
    assert classifier.classify(duration_seconds=181) == SocialContentType.VIDEO
    assert classifier.classify(duration_seconds=600) == SocialContentType.VIDEO
    assert classifier.classify_domain(duration_seconds=600) == ContentType.VIDEO


def test_classifier_negative_gate_overrides_shorts_signals():
    classifier = YouTubeContentClassifier(max_short_duration_seconds=180)
    # Long video containing #shorts in title and tags must NOT be classified as short
    result = classifier.classify(
        duration_seconds=600,
        title="Documentary on Bastar Art #shorts",
        description="Full feature film",
        source_url="https://youtube.com/watch?v=123",
        tags=["shorts", "cg_tourism"],
    )
    assert result == SocialContentType.VIDEO
    assert classifier.classify_domain(duration_seconds=600, title="#shorts") == ContentType.VIDEO


def test_classifier_title_and_description_signals():
    classifier = YouTubeContentClassifier()
    assert classifier.classify(duration_seconds=50, title="Tirathgarh in Monsoons #Shorts") == SocialContentType.SHORT
    assert classifier.classify(duration_seconds=45, description="Watch this quick clip #short") == SocialContentType.SHORT
    assert classifier.classify(duration_seconds=30, source_url="https://youtube.com/shorts/abc123xyz") == SocialContentType.SHORT


def test_classifier_tags_signals():
    classifier = YouTubeContentClassifier()
    assert classifier.classify(duration_seconds=75, tags=["bastar", "ytshorts"]) == SocialContentType.SHORT
    assert classifier.classify(duration_seconds=75, tags=["chhattisgarh", "SHORTS"]) == SocialContentType.SHORT


def test_classifier_zero_duration_is_video():
    classifier = YouTubeContentClassifier()
    assert classifier.classify(duration_seconds=0) == SocialContentType.VIDEO
