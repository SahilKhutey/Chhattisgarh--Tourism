from __future__ import annotations

from typing import Any

BENCHMARK_EVALUATION_DATASET: list[dict[str, Any]] = [
    {
        "query": "waterfalls in Bastar",
        "locale": "en",
        "expected_slugs": ["chitrakote-waterfall", "tirathgarh-waterfall"],
        "category": "NATURE",
    },
    {
        "query": "peaceful nature places",
        "locale": "en",
        "expected_slugs": ["chitrakote-waterfall", "kanger-valley-national-park", "barnawapara-sanctuary"],
        "category": "NATURE",
    },
    {
        "query": "historical temples",
        "locale": "en",
        "expected_slugs": ["bhoramdeo-temple", "sirpur-heritage-site", "danteshwari-temple"],
        "category": "SPIRITUAL",
    },
    {
        "query": "Sirpur",
        "locale": "en",
        "expected_slugs": ["sirpur-heritage-site"],
        "category": "HERITAGE",
    },
    {
        "query": "झरना",
        "locale": "hi",
        "expected_slugs": ["chitrakote-waterfall", "tirathgarh-waterfall"],
        "category": "NATURE",
    },
]
