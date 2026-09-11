from __future__ import annotations

import pytest
from app.cli.verify_search_index import verify_index
from app.modules.search.indexer import SearchIndexer


def test_cli_rebuild_and_verify(db_session, published_entry, monkeypatch):
    # Monkeypatch SessionLocal in cli modules to return db_session
    monkeypatch.setattr("app.cli.rebuild_search_index.SessionLocal", lambda: db_session)
    monkeypatch.setattr("app.cli.verify_search_index.SessionLocal", lambda: db_session)

    # Initially missing
    code_before = verify_index()
    assert code_before == 1  # Fails because published entry is missing from index

    # Index entry
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    # Now verify should pass
    code_after = verify_index()
    assert code_after == 0  # HEALTHY
