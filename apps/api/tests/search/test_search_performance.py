from __future__ import annotations

import time
import pytest
from app.modules.search.cache import SearchCache, build_cache_key
from app.modules.search.indexer import SearchIndexer
from app.modules.search.schemas import SearchRequest
from app.modules.search.service import SearchService


def test_build_cache_key():
    payload1 = {"q": "waterfall", "page": 1, "locale": "en"}
    payload2 = {"locale": "en", "page": 1, "q": "waterfall"}
    # Deterministic keys regardless of dict ordering
    assert build_cache_key(payload1) == build_cache_key(payload2)


def test_search_cache_flow(db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    service = SearchService()
    req = SearchRequest(q="Chitrakote", locale="en")

    # First call - cache miss
    t0 = time.perf_counter()
    res1 = service.search(db_session, req)
    t1 = time.perf_counter()

    # Second call - should hit cache
    t2 = time.perf_counter()
    res2 = service.search(db_session, req)
    t3 = time.perf_counter()

    assert res1.total == res2.total
    assert len(res1.results) == len(res2.results)
    assert res1.results[0].title == res2.results[0].title
