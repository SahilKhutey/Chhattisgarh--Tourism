from __future__ import annotations

from .normalization import normalize_query


def expand_query(
    query: str,
    synonyms: dict[str, list[str]],
    max_expansions: int = 8,
) -> list[str]:
    """
    Expands query terms deterministically using controlled synonyms and taxonomy.
    Bounds maximum expansions to prevent query explosion or performance degradation.
    """
    normalized = normalize_query(query)
    terms = [query]

    for term, expansions in synonyms.items():
        norm_term = normalize_query(term)
        if norm_term in normalized:
            for exp in expansions:
                if exp not in terms:
                    terms.append(exp)
                if len(terms) >= max_expansions:
                    return terms[:max_expansions]

    return terms[:max_expansions]
