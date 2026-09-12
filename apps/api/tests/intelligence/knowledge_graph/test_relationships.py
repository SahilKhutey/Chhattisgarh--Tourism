from __future__ import annotations

import pytest
from app.modules.intelligence.knowledge_graph.extraction import EntityExtractor
from app.modules.intelligence.knowledge_graph.models import GraphRelationship


def test_relationship_creation_and_uniqueness(db_session):
    extractor = EntityExtractor()
    waterfall = extractor.resolve_or_create_entity(db_session, "WATERFALL", "Chitrakote", "en")
    district = extractor.resolve_or_create_entity(db_session, "DISTRICT", "Bastar", "en")

    rel1 = extractor.add_relationship(
        db=db_session,
        source_id=waterfall.id,
        relationship_type="LOCATED_IN",
        target_id=district.id,
        confidence=1.0,
        source="CONTENT_FIELD",
    )
    assert rel1.id is not None
    assert rel1.relationship_type == "LOCATED_IN"
    assert rel1.confidence == 1.0
    assert rel1.source == "CONTENT_FIELD"

    # Adding again should update rather than duplicate
    rel2 = extractor.add_relationship(
        db=db_session,
        source_id=waterfall.id,
        relationship_type="LOCATED_IN",
        target_id=district.id,
        confidence=0.9,
    )
    assert rel1.id == rel2.id

    count = db_session.query(GraphRelationship).count()
    assert count == 1
