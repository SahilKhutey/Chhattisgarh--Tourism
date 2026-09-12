from __future__ import annotations

from app.modules.intelligence.query.expansion import expand_query


def test_controlled_query_expansion():
    synonyms = {
        "waterfall": ["waterfalls", "falls", "cascade", "झरना"],
        "temple": ["mandir", "shrine", "pilgrimage", "मंदिर"],
    }

    terms = expand_query("chitrakote waterfall", synonyms, max_expansions=5)
    assert "chitrakote waterfall" in terms
    assert "waterfalls" in terms
    assert "falls" in terms
    assert len(terms) <= 5


def test_query_expansion_bounds():
    synonyms = {
        "trip": [f"synonym-{i}" for i in range(20)],
    }

    terms = expand_query("family trip", synonyms, max_expansions=8)
    assert len(terms) == 8
