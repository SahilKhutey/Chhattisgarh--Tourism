from __future__ import annotations

from math import exp


def freshness_score(age_days: float) -> float:
    """Computes freshness score with exponential decay over 365 days."""
    if age_days < 0:
        age_days = 0.0
    return exp(-age_days / 365.0)


def distance_score(distance_km: float | None) -> float:
    """Computes geographic proximity score with exponential decay over 50 km."""
    if distance_km is None:
        return 0.0
    return exp(-distance_km / 50.0)


def calculate_exact_match(
    query: str,
    title: str,
    aliases: list[str] | None = None,
) -> float:
    """
    Computes exact/prefix title match bonus:
    1.0 for full exact match (title or aliases)
    0.8 for prefix match
    0.5 for word boundary / substring match
    0.0 otherwise
    """
    q = query.strip().lower()
    t = title.strip().lower()

    if not q:
        return 0.0

    if t == q:
        return 1.0

    if aliases:
        for alias in aliases:
            if alias.strip().lower() == q:
                return 1.0

    if t.startswith(q):
        return 0.8

    if f" {q} " in f" {t} ":
        return 0.6

    if q in t:
        return 0.4

    return 0.0


def calculate_quality_score(
    *,
    required_complete: bool = True,
    has_description: bool = False,
    has_image: bool = False,
    has_location: bool = False,
    accessibility_complete: bool = False,
) -> float:
    """
    Calculates a content quality score in [0.0, 1.0] from completeness attributes.
    """
    score = 0.0
    if required_complete:
        score += 0.30
    if has_description:
        score += 0.20
    if has_image:
        score += 0.15
    if has_location:
        score += 0.15
    if accessibility_complete:
        score += 0.20
    return min(1.0, max(0.0, score))


def calculate_score(
    text_score: float,
    exact_match: float,
    quality_score: float,
    popularity_score: float,
    freshness: float,
    geo_score: float,
) -> float:
    """
    Weighted combination of discovery ranking signals:
    - Text score (FTS / Trigram): 50%
    - Exact / Prefix Match: 15%
    - Quality Score: 15%
    - Popularity: 10%
    - Freshness: 5%
    - Geo Proximity: 5%
    """
    # Normalize inputs to [0.0, 1.0]
    ts = max(0.0, min(1.0, text_score))
    em = max(0.0, min(1.0, exact_match))
    qs = max(0.0, min(1.0, quality_score))
    ps = max(0.0, min(1.0, popularity_score))
    fs = max(0.0, min(1.0, freshness))
    gs = max(0.0, min(1.0, geo_score))

    return (
        ts * 0.50
        + em * 0.15
        + qs * 0.15
        + ps * 0.10
        + fs * 0.05
        + gs * 0.05
    )
