from __future__ import annotations

from app.modules.intelligence.query.intent import IntentClassifier, SearchIntent


def test_intent_classification():
    classifier = IntentClassifier()

    assert classifier.classify("peaceful waterfalls in nature") == SearchIntent.NATURE
    assert classifier.classify("ancient Shiva temples") == SearchIntent.SPIRITUAL
    assert classifier.classify("tiger safari in sanctuary") == SearchIntent.WILDLIFE
    assert classifier.classify("historical fort and monuments") == SearchIntent.HERITAGE
    assert classifier.classify("trekking and camping adventure") == SearchIntent.ADVENTURE
    assert classifier.classify("traditional chhattisgarh food") == SearchIntent.FOOD
    assert classifier.classify("luxury resort stay") == SearchIntent.STAY


def test_intent_classification_multilingual():
    classifier = IntentClassifier()

    assert classifier.classify("सुंदर झरना") == SearchIntent.NATURE
    assert classifier.classify("प्राचीन मंदिर दर्शन") == SearchIntent.SPIRITUAL
    assert classifier.classify("वन्यजीव अभयारण्य") == SearchIntent.WILDLIFE
    assert classifier.classify("ऐतिहासिक किला") == SearchIntent.HERITAGE


def test_intent_fallback_behavior():
    classifier = IntentClassifier()

    assert classifier.classify("") == SearchIntent.DISCOVERY
    assert classifier.classify("xyz random query 12345") == SearchIntent.UNKNOWN
