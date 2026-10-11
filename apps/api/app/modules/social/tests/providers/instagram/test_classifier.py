from __future__ import annotations

import pytest

from app.modules.social.domain.enums import ContentType, SocialContentType
from app.modules.social.providers.instagram.classifier import InstagramContentClassifier
from app.modules.social.providers.instagram.errors import ContentNormalizationError


@pytest.fixture
def classifier() -> InstagramContentClassifier:
    return InstagramContentClassifier()


def test_classify_reels(classifier: InstagramContentClassifier):
    assert classifier.classify(media_type="VIDEO", media_product_type="REELS") == SocialContentType.REEL
    assert classifier.classify(media_type="video", media_product_type="reels") == SocialContentType.REEL
    assert classifier.classify_domain(media_type="VIDEO", media_product_type="REELS") == ContentType.REEL


def test_classify_video(classifier: InstagramContentClassifier):
    assert classifier.classify(media_type="VIDEO", media_product_type="FEED") == SocialContentType.VIDEO
    assert classifier.classify(media_type="video") == SocialContentType.VIDEO
    assert classifier.classify_domain(media_type="VIDEO") == ContentType.VIDEO


def test_classify_image_post(classifier: InstagramContentClassifier):
    assert classifier.classify(media_type="IMAGE") == SocialContentType.POST
    assert classifier.classify(media_type="image", media_product_type="feed") == SocialContentType.POST
    assert classifier.classify_domain(media_type="IMAGE") == ContentType.POST


def test_classify_carousel_post(classifier: InstagramContentClassifier):
    assert classifier.classify(media_type="CAROUSEL_ALBUM") == SocialContentType.POST
    assert classifier.classify(media_type="carousel_album") == SocialContentType.POST
    assert classifier.classify_domain(media_type="CAROUSEL_ALBUM") == ContentType.POST


def test_classify_unsupported_media_type_raises(classifier: InstagramContentClassifier):
    with pytest.raises(ContentNormalizationError, match="Unsupported Instagram media type"):
        classifier.classify(media_type="STORY")

    with pytest.raises(ContentNormalizationError, match="Unsupported Instagram media type"):
        classifier.classify(media_type="AUDIO")

    with pytest.raises(ContentNormalizationError, match="Unsupported Instagram media type"):
        classifier.classify_domain(media_type="UNKNOWN")
