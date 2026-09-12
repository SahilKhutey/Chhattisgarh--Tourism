from __future__ import annotations

import sys
from sqlalchemy import func, select
from app.core.database import SessionLocal
from app.modules.intelligence.knowledge_graph.models import EntityAlias, GraphEntity, GraphRelationship


def verify_knowledge_graph() -> int:
    db = SessionLocal()
    try:
        total_entities = db.scalar(select(func.count(GraphEntity.id))) or 0
        total_relationships = db.scalar(select(func.count(GraphRelationship.id))) or 0
        total_aliases = db.scalar(select(func.count(EntityAlias.id))) or 0

        # Check relationships pointing to missing entities
        broken_relationships = 0
        rels = db.scalars(select(GraphRelationship)).all()
        entity_ids = set(db.scalars(select(GraphEntity.id)).all())

        for r in rels:
            if r.source_entity_id not in entity_ids or r.target_entity_id not in entity_ids:
                broken_relationships += 1

        print(f"Total Entities:        {total_entities}")
        print(f"Total Relationships:   {total_relationships}")
        print(f"Total Aliases:         {total_aliases}")
        print(f"Broken Relationships:  {broken_relationships}")

        healthy = (broken_relationships == 0)
        print(f"\nSTATUS: {'HEALTHY' if healthy else 'DEGRADED'}")
        return 0 if healthy else 1
    finally:
        db.close()


def main() -> None:
    sys.exit(verify_knowledge_graph())


if __name__ == "__main__":
    main()
