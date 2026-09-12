from __future__ import annotations

import pytest
from sqlalchemy.exc import IntegrityError
from app.modules.intelligence.embeddings.service import EmbeddingService


def test_unique_constraint_on_entry_locale_model(db_session, sample_data):
    service = EmbeddingService()
    chitrakote = sample_data["chitrakote"]

    emb = service.index_entry(db_session, chitrakote, locale="en")
    assert emb is not None

    # Adding a separate embedding record manually with exact same unique key should raise IntegrityError
    from app.modules.intelligence.embeddings.models import ContentEmbedding
    import uuid

    duplicate = ContentEmbedding(
        id=uuid.uuid4(),
        content_entry_id=chitrakote.id,
        model_id=emb.model_id,
        locale="en",
        embedding=emb.embedding,
        source_hash="duplicate-hash",
        content_version="1.0",
    )
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_multiple_locales_supported(db_session, sample_data):
    service = EmbeddingService()
    chitrakote = sample_data["chitrakote"]

    emb_en = service.index_entry(db_session, chitrakote, locale="en")
    emb_hi = service.index_entry(db_session, chitrakote, locale="hi")

    assert emb_en is not None
    assert emb_hi is not None
    assert emb_en.id != emb_hi.id
    assert emb_en.locale == "en"
    assert emb_hi.locale == "hi"
