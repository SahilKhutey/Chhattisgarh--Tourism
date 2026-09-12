from __future__ import annotations

from app.modules.intelligence.knowledge_graph.service import KnowledgeGraphService


def test_extract_from_published_entry(db_session, sample_data):
    service = KnowledgeGraphService()
    chitrakote = sample_data["chitrakote"]

    result = service.build_for_entry(db_session, chitrakote, locale="en")
    assert result is not None
    entity, rels = result

    assert entity.canonical_name == "Chitrakote Waterfall"
    assert entity.entity_type == "WATERFALL"

    rel_types = [r.relationship_type for r in rels]
    assert "LOCATED_IN" in rel_types
    assert "HAS_CATEGORY" in rel_types
    assert "HAS_ACTIVITY" in rel_types


def test_published_only_graph(db_session, sample_data):
    service = KnowledgeGraphService()
    draft = sample_data["draft"]

    result = service.build_for_entry(db_session, draft, locale="en")
    assert result is None
