from __future__ import annotations

import uuid
import pytest
from app.modules.search.geo import calculate_bounding_box, haversine_km
from app.modules.search.models import SearchDocument
from app.modules.search.schemas import SearchRequest
from app.modules.search.service import SearchService


def test_haversine_distance():
    # Raipur approx (21.2514, 81.6296) to Jagdalpur approx (19.0740, 82.0080)
    dist = haversine_km(21.2514, 81.6296, 19.0740, 82.0080)
    assert 240.0 < dist < 260.0
    # Same point distance should be 0
    assert haversine_km(21.2514, 81.6296, 21.2514, 81.6296) == 0.0


def test_calculate_bounding_box():
    lat, lon, radius = 21.25, 81.63, 50.0
    min_lat, max_lat, min_lon, max_lon = calculate_bounding_box(lat, lon, radius)
    assert min_lat < lat < max_lat
    assert min_lon < lon < max_lon


def test_radius_search_filters_locations(db_session):
    # Raipur place: (21.25, 81.63)
    raipur_doc = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=uuid.uuid4(),
        template_id=uuid.uuid4(),
        template_version_id=uuid.uuid4(),
        slug="raipur-marine-drive",
        locale="en",
        title="Telibandha Lake Marine Drive",
        description="Raipur city lake promenade.",
        searchable_text="Marine drive Raipur.",
        content_type="nature",
        district="Raipur",
        categories=["nature"],
        tags=[],
        latitude=21.24,
        longitude=81.65,
        is_published=True,
    )
    # Bastar place: (19.20, 81.70) ~230 km away
    bastar_doc = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=uuid.uuid4(),
        template_id=uuid.uuid4(),
        template_version_id=uuid.uuid4(),
        slug="chitrakote-waterfall",
        locale="en",
        title="Chitrakote Waterfall",
        description="Waterfall in Bastar.",
        searchable_text="Chitrakote waterfall Bastar.",
        content_type="nature",
        district="Bastar",
        categories=["nature"],
        tags=[],
        latitude=19.20,
        longitude=81.70,
        is_published=True,
    )
    db_session.add_all([raipur_doc, bastar_doc])
    db_session.commit()

    service = SearchService()
    # Search from Raipur center with radius 30 km -> should return Raipur doc, exclude Bastar
    res = service.search(
        db_session,
        SearchRequest(
            q="",
            latitude=21.25,
            longitude=81.63,
            radius_km=30.0,
        ),
    )

    slugs = [r.slug for r in res.results]
    assert "raipur-marine-drive" in slugs
    assert "chitrakote-waterfall" not in slugs
    assert res.results[0].distance_km is not None
    assert res.results[0].distance_km < 30.0
