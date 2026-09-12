from __future__ import annotations

from sqlalchemy import select
from app.modules.intelligence.embeddings.models import ContentEmbedding
from app.modules.intelligence.embeddings.service import (
    EmbeddingService,
    build_semantic_text,
    calculate_source_hash,
)


def test_build_semantic_text_structure():
    text = build_semantic_text(
        title="Chitrakote Waterfall",
        content_type="WATERFALL",
        district="Bastar",
        categories=["Nature", "Waterfalls"],
        tags=["photography", "monsoon"],
        description="The Niagara of India.",
        body="Situated on Indravati river.",
    )
    assert "Chitrakote Waterfall" in text
    assert "Type: WATERFALL" in text
    assert "District: Bastar" in text
    assert "Categories: Nature, Waterfalls" in text
    assert "Tags: monsoon, photography" in text
    assert "The Niagara of India." in text


def test_calculate_source_hash_stability():
    t1 = "Sample destination text"
    t2 = "Sample destination text"
    t3 = "Different destination text"
    assert calculate_source_hash(t1) == calculate_source_hash(t2)
    assert calculate_source_hash(t1) != calculate_source_hash(t3)


def test_index_entry_creates_embedding(db_session, sample_data):
    service = EmbeddingService()
    chitrakote = sample_data["chitrakote"]

    emb = service.index_entry(db_session, chitrakote, locale="en")
    assert emb is not None
    assert emb.content_entry_id == chitrakote.id
    assert len(emb.embedding) == 1024
    assert emb.source_hash != ""

    # Verify persisted in database
    db_emb = db_session.scalar(
        select(ContentEmbedding).where(ContentEmbedding.content_entry_id == chitrakote.id)
    )
    assert db_emb is not None
    assert db_emb.id == emb.id


def test_index_entry_skips_recalculation_if_hash_unchanged(db_session, sample_data):
    service = EmbeddingService()
    chitrakote = sample_data["chitrakote"]

    emb1 = service.index_entry(db_session, chitrakote, locale="en")
    assert emb1 is not None

    # Call again without changing entry values
    emb2 = service.index_entry(db_session, chitrakote, locale="en")
    assert emb2 is not None
    assert emb2.id == emb1.id
    assert emb2.source_hash == emb1.source_hash


def test_unpublished_content_has_no_embedding(db_session, sample_data):
    service = EmbeddingService()
    draft = sample_data["draft"]

    emb = service.index_entry(db_session, draft, locale="en")
    assert emb is None

    # Verify nothing in database
    existing = db_session.scalar(
        select(ContentEmbedding).where(ContentEmbedding.content_entry_id == draft.id)
    )
    assert existing is None


def test_remove_entry_purges_embeddings(db_session, sample_data):
    service = EmbeddingService()
    tirathgarh = sample_data["tirathgarh"]

    emb = service.index_entry(db_session, tirathgarh, locale="en")
    assert emb is not None

    deleted_count = service.remove_entry(db_session, tirathgarh.id)
    assert deleted_count == 1

    remaining = db_session.scalar(
        select(ContentEmbedding).where(ContentEmbedding.content_entry_id == tirathgarh.id)
    )
    assert remaining is None
