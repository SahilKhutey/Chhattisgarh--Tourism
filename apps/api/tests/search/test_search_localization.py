from __future__ import annotations

import pytest
from app.modules.search.indexer import SearchIndexer
from app.modules.search.schemas import SearchRequest
from app.modules.search.service import SearchService


def test_multilingual_indexing_and_search(db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    service = SearchService()

    # Search in English
    res_en = service.search(db_session, SearchRequest(q="Chitrakote", locale="en"))
    assert len(res_en.results) >= 1
    assert res_en.results[0].title == "Chitrakote Waterfall"
    assert res_en.results[0].district == "Bastar"

    # Search in Hindi
    res_hi = service.search(db_session, SearchRequest(q="चित्रकूट", locale="hi"))
    assert len(res_hi.results) >= 1
    assert res_hi.results[0].title == "चित्रकूट जलप्रपात"
    assert res_hi.results[0].district == "बस्तर"
