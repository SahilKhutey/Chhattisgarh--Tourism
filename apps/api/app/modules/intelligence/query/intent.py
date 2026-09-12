from __future__ import annotations

from enum import StrEnum


class SearchIntent(StrEnum):
    DISCOVERY = "discovery"
    LOCATION = "location"
    EXPERIENCE = "experience"
    HERITAGE = "heritage"
    NATURE = "nature"
    WILDLIFE = "wildlife"
    SPIRITUAL = "spiritual"
    ADVENTURE = "adventure"
    FOOD = "food"
    STAY = "stay"
    UNKNOWN = "unknown"


INTENT_TERMS: dict[SearchIntent, set[str]] = {
    SearchIntent.SPIRITUAL: {
        "temple", "temples", "mandir", "pilgrimage", "shrine", "spiritual",
        "sacred", "deity", "ashram", "puja", "shiva", "devi", "buddha", "monastery", "मंदिर", "तीर्थ",
    },
    SearchIntent.NATURE: {
        "nature", "forest", "waterfall", "waterfalls", "lake", "river", "valley",
        "scenic", "peaceful", "greenery", "hills", "falls", "प्रकृति", "झरना", "जंगल",
    },
    SearchIntent.WILDLIFE: {
        "wildlife", "animals", "sanctuary", "tiger", "national park", "birds",
        "fauna", "safari", "वन्यजीव", "अभयारण्य",
    },
    SearchIntent.HERITAGE: {
        "heritage", "historical", "history", "fort", "monument", "palace",
        "archaeology", "ruins", "ancient", "museum", "किला", "धरोहर", "ऐतिहासिक",
    },
    SearchIntent.ADVENTURE: {
        "adventure", "trekking", "camping", "hiking", "rafting", "caving",
        "boating", "sports", "ट्रैकिंग", "साहसिक",
    },
    SearchIntent.FOOD: {
        "food", "cuisine", "taste", "dish", "sweet", "traditional food", "व्यंजन",
    },
    SearchIntent.STAY: {
        "stay", "hotel", "resort", "homestay", "camp", "cottage", "होटल", "रिसॉर्ट",
    },
}


class IntentClassifier:
    """
    Deterministic query intent classifier.
    Never hallucinates unverified intents; defaults safely to UNKNOWN or DISCOVERY.
    """

    def classify(self, query: str) -> SearchIntent:
        if not query or not query.strip():
            return SearchIntent.DISCOVERY

        normalized = query.lower().strip()
        tokens = set(normalized.split())

        best_intent = SearchIntent.UNKNOWN
        best_score = 0

        for intent, keywords in INTENT_TERMS.items():
            score = 0
            for kw in keywords:
                if kw in tokens:
                    score += 2
                elif len(kw) > 3 and kw in normalized:
                    score += 1
            if score > best_score:
                best_score = score
                best_intent = intent

        return best_intent
