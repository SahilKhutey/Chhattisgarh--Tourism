from __future__ import annotations

import pytest
from sqlalchemy import select
from app.modules.search.indexer import SearchIndexer
from app.modules.search.models import SearchDocument


def test_index_published_entry(db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    docs = list(
        db_session.scalars(
            select(SearchDocument).where(
                SearchDocument.content_entry_id == published_entry.id
            )
        )
    )
    # Indexed for supported locales ('en', 'hi', 'chg')
    assert len(docs) == 3
    en_doc = next(d for d in docs if d.locale == "en")
    assert en_doc.title == "Chitrakote Waterfall"
    assert en_doc.district == "Bastar"
    assert en_doc.content_type == "nature"
    assert en_doc.template_version_id == published_entry.template_version_id
    assert en_doc.is_published is True


def test_unpublish_removes_from_index(db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    # Verify documents exist
    count = len(list(db_session.scalars(select(SearchDocument))))
    assert count >= 3

    # Now unpublish/archive entry
    published_entry.status = "ARCHIVED"
    indexer.index_entry(db_session, published_entry)

    # Documents should now be deleted
    docs = list(
        db_session.scalars(
            select(SearchDocument).where(
                SearchDocument.content_entry_id == published_entry.id
            )
        )
    )
    assert len(docs) == 0


def test_update_reindexes_entry(db_session, published_entry):
    indexer = SearchIndexer()
    indexer.index_entry(db_session, published_entry)

    # Update title
    published_entry.values["title"] = "Updated Chitrakote Falls"
    indexer.index_entry(db_session, published_entry)

    en_doc = db_session.scalar(
        select(SearchDocument).where(
            SearchDocument.content_entry_id == published_entry.id,
            SearchDocument.locale == "en",
        )
    )
    assert en_doc.title == "Updated Chitrakote Falls"


def test_rebuild_all_index(db_session, published_entry, draft_entry):
    indexer = SearchIndexer()
    # Create an orphan document
    orphan = SearchDocument(
        content_entry_id=draft_entry.id,
        template_id=draft_entry.template_id,
        template_version_id=draft_entry.template_version_id,
        slug="orphan-doc",
        locale="en",
        title="Orphan Document",
        content_type="destination",
        categories=[],
        tags=[],
    )
    db_session.add(orphan)
    db_session.commit()

    indexed_count, removed_count = indexer.rebuild_all(db_session)
    assert indexed_count >= 1
    assert removed_count >= 1

    # Verify orphan was removed
    orphan_check = db_session.scalar(
        select(SearchDocument).where(SearchDocument.slug == "orphan-doc")
    )
    assert orphan_check is None
