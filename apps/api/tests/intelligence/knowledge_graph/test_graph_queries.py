from __future__ import annotations

from app.modules.intelligence.knowledge_graph.graph import BoundedGraphTraverser
from app.modules.intelligence.knowledge_graph.service import KnowledgeGraphService


def test_bounded_graph_traversal(db_session, sample_data):
    service = KnowledgeGraphService()
    chitrakote = sample_data["chitrakote"]
    result = service.build_for_entry(db_session, chitrakote, locale="en")
    assert result is not None
    entity, _ = result

    traverser = BoundedGraphTraverser()
    visited_nodes, edges = traverser.traverse(db_session, entity.id, max_depth=5, max_nodes=100)

    # Must be bounded by MAX_DEPTH=2 and MAX_NODES=50
    assert len(visited_nodes) <= 50
    assert len(visited_nodes) > 0


def test_get_content_context_public(db_session, sample_data):
    service = KnowledgeGraphService()
    chitrakote = sample_data["chitrakote"]
    service.build_for_entry(db_session, chitrakote, locale="en")

    ctx = service.get_content_context(db_session, slug="chitrakote-waterfall", locale="en")
    assert ctx is not None
    assert ctx.entity.name == "Chitrakote Waterfall"
    assert ctx.located_in is not None
    assert ctx.located_in.name == "Bastar"
    assert "Nature" in ctx.categories or "Waterfalls" in ctx.categories
    assert "Photography" in ctx.activities or "Sightseeing" in ctx.activities
