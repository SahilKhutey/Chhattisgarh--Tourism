from __future__ import annotations

import uuid
import pytest
from app.modules.search.models import SearchDocument
from app.modules.search.schemas import SearchRequest
from app.modules.search.service import SearchService
from app.modules.search.taxonomy import resolve_content_type


def test_resolve_content_type():
    assert resolve_content_type("waterfall-template", "Waterfall View", "nature") == "nature"
    assert resolve_content_type("temple-circuit", "Temple Tour", "spiritual") == "spiritual"
    assert resolve_content_type("wildlife-park", "Sanctuary Guide", "wildlife") == "wildlife"
    assert resolve_content_type("tribal-crafts", "Bastar Arts", "culture") == "experiences"
    assert resolve_content_type("general-destination", "Places to see", None) == "destination"
    assert resolve_content_type(None, None, None) != "unknown"


def test_district_and_category_filters(db_session):
    doc1 = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=uuid.uuid4(),
        template_id=uuid.uuid4(),
        template_version_id=uuid.uuid4(),
        slug="tirathgarh",
        locale="en",
        title="Tirathgarh Waterfall",
        description="Waterfall in Kanger Valley.",
        searchable_text="Tirathgarh Bastar.",
        content_type="nature",
        district="Bastar",
        categories=["nature", "waterfalls"],
        tags=["waterfall"],
        is_published=True,
    )
    doc2 = SearchDocument(
        id=uuid.uuid4(),
        content_entry_id=uuid.uuid4(),
        template_id=uuid.uuid4(),
        template_version_id=uuid.uuid4(),
        slug="danteshwari-temple",
        locale="en",
        title="Danteshwari Temple",
        description="Famous Shakti Peeth in Dantewada.",
        searchable_text="Danteshwari temple spiritual.",
        content_type="spiritual",
        district="Dantewada",
        categories=["spiritual", "temples"],
        tags=["temple"],
        is_published=True,
    )
    db_session.add_all([doc1, doc2])
    db_session.commit()

    service = SearchService()

    # Filter by district Bastar
    res_dist = service.search(db_session, SearchRequest(q="", district="Bastar"))
    assert len(res_dist.results) == 1
    assert res_dist.results[0].slug == "tirathgarh"

    # Filter by category spiritual
    res_cat = service.search(db_session, SearchRequest(q="", category="spiritual"))
    assert len(res_cat.results) == 1
    assert res_cat.results[0].slug == "danteshwari-temple"
