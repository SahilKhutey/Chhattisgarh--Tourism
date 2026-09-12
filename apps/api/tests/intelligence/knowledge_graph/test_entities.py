from __future__ import annotations

from sqlalchemy import select
from app.modules.intelligence.knowledge_graph.extraction import EntityExtractor
from app.modules.intelligence.knowledge_graph.models import EntityAlias, GraphEntity


def test_entity_creation(db_session):
    extractor = EntityExtractor()
    entity = extractor.resolve_or_create_entity(
        db=db_session,
        entity_type="DISTRICT",
        name="Bastar",
        locale="en",
    )

    assert entity.id is not None
    assert entity.canonical_name == "Bastar"
    assert entity.entity_type == "DISTRICT"
    assert entity.slug == "bastar"


def test_entity_deduplication_via_canonical_name_and_slug(db_session):
    extractor = EntityExtractor()
    e1 = extractor.resolve_or_create_entity(
        db=db_session,
        entity_type="DISTRICT",
        name="Bastar",
        locale="en",
    )
    e2 = extractor.resolve_or_create_entity(
        db=db_session,
        entity_type="DISTRICT",
        name="bastar",
        locale="en",
    )

    assert e1.id == e2.id
    count = db_session.query(GraphEntity).filter(GraphEntity.entity_type == "DISTRICT").count()
    assert count == 1


def test_alias_resolution(db_session):
    extractor = EntityExtractor()
    primary = extractor.resolve_or_create_entity(
        db=db_session,
        entity_type="DISTRICT",
        name="Bastar",
        locale="en",
    )

    # Register an alias manually: "Bastar District"
    import uuid
    from app.modules.intelligence.knowledge_graph.extraction import normalize_alias_text
    alias = EntityAlias(
        id=uuid.uuid4(),
        entity_id=primary.id,
        alias="Bastar District",
        locale="en",
        normalized_alias=normalize_alias_text("Bastar District"),
        entity_type="DISTRICT",
    )
    db_session.add(alias)
    db_session.commit()

    # Querying with alias should resolve to the primary entity
    resolved = extractor.resolve_or_create_entity(
        db=db_session,
        entity_type="DISTRICT",
        name="Bastar District",
        locale="en",
    )
    assert resolved.id == primary.id
