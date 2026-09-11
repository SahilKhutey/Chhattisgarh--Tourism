from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
from app.modules.search.models import SearchDocument
from app.modules.search.ranking import (
    calculate_exact_match,
    calculate_quality_score,
    calculate_score,
    distance_score,
    freshness_score,
)
from app.modules.search.schemas import SearchRequest
from app.modules.search.service import SearchService


def test_freshness_score_decay():
    f0 = freshness_score(0)
    f100 = freshness_score(100)
    f365 = freshness_score(365)
    assert f0 > f100 > f365
    assert round(f0, 2) == 1.0


def test_distance_score_decay():
    d0 = distance_score(0)
    d25 = distance_score(25)
    d100 = distance_score(100)
    d_none = distance_score(None)
    assert d0 > d25 > d100
    assert d_none == 0.0


def test_exact_match_score():
    assert calculate_exact_match("Sirpur", "Sirpur") == 1.0
    assert calculate_exact_match("Sirpur", "Sirpur", ["Shripur"]) == 1.0
    assert calculate_exact_match("Shripur", "Sirpur", ["Shripur"]) == 1.0
    assert calculate_exact_match("Sir", "Sirpur") == 0.8
    assert calculate_exact_match("Sirpur", "Temples near Sirpur") < 1.0


def test_quality_score_calculation():
    full_score = calculate_quality_score(
        required_complete=True,
        has_description=True,
        has_image=True,
        has_location=True,
        accessibility_complete=True,
    )
    partial_score = calculate_quality_score(
        required_complete=True,
        has_description=False,
        has_image=False,
        has_location=False,
        accessibility_complete=False,
    )
    assert full_score == 1.0
    assert partial_score == 0.30


def test_exact_title_ranks_first(db_session):
    # Create two documents: one titled "Sirpur", one titled "Temples near Sirpur"
    doc_exact = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=uuid.uuid4(),
        template_id=uuid.uuid4(),
        template_version_id=uuid.uuid4(),
        slug="sirpur",
        locale="en",
        title="Sirpur",
        description="Historical site in Mahasamund.",
        searchable_text="Sirpur historical ancient Buddhist and Hindu sites.",
        content_type="heritage",
        district="Mahasamund",
        categories=["heritage"],
        tags=["ancient"],
        quality_score=0.9,
        popularity_score=0.5,
        is_published=True,
    )
    doc_near = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=uuid.uuid4(),
        template_id=uuid.uuid4(),
        template_version_id=uuid.uuid4(),
        slug="temples-near-sirpur",
        locale="en",
        title="Temples near Sirpur",
        description="Various shrines around the town.",
        searchable_text="Temples near Sirpur cluster.",
        content_type="heritage",
        district="Mahasamund",
        categories=["heritage"],
        tags=["temple"],
        quality_score=0.9,
        popularity_score=0.5,
        is_published=True,
    )
    db_session.add_all([doc_near, doc_exact])
    db_session.commit()

    service = SearchService()
    response = service.search(db_session, SearchRequest(q="Sirpur"))

    assert len(response.results) >= 2
    assert response.results[0].title == "Sirpur"
    assert response.results[1].title == "Temples near Sirpur"
    assert response.results[0].score > response.results[1].score
