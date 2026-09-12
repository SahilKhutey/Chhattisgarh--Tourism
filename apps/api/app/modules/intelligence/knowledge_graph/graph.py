from __future__ import annotations

from collections import deque
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .models import GraphEntity, GraphRelationship


class BoundedGraphTraverser:
    """
    Safely traverses the knowledge graph with hard depth and node limits.
    Prevents cycles and unbounded graph queries.
    """

    MAX_DEPTH = 2
    MAX_NODES = 50

    def traverse(
        self,
        db: Session,
        start_entity_id: UUID,
        max_depth: int = 2,
        max_nodes: int = 50,
    ) -> tuple[dict[UUID, GraphEntity], list[GraphRelationship]]:
        """
        Executes bounded BFS from start_entity_id up to max_depth and max_nodes.
        Returns visited entities and collected relationship edges.
        """
        depth_limit = min(max_depth, self.MAX_DEPTH)
        node_limit = min(max_nodes, self.MAX_NODES)

        visited_entities: dict[UUID, GraphEntity] = {}
        collected_relationships: list[GraphRelationship] = []
        visited_relationship_ids: set[UUID] = set()

        start_entity = db.get(GraphEntity, start_entity_id)
        if not start_entity:
            return visited_entities, collected_relationships

        visited_entities[start_entity_id] = start_entity
        queue: deque[tuple[UUID, int]] = deque([(start_entity_id, 0)])

        while queue and len(visited_entities) < node_limit:
            current_id, current_depth = queue.popleft()
            if current_depth >= depth_limit:
                continue

            # Find outgoing and incoming edges
            stmt = select(GraphRelationship).where(
                or_(
                    GraphRelationship.source_entity_id == current_id,
                    GraphRelationship.target_entity_id == current_id,
                )
            ).limit(node_limit)

            edges = db.scalars(stmt).all()
            for edge in edges:
                if edge.id in visited_relationship_ids:
                    continue
                visited_relationship_ids.add(edge.id)
                collected_relationships.append(edge)

                next_id = edge.target_entity_id if edge.source_entity_id == current_id else edge.source_entity_id
                if next_id not in visited_entities and len(visited_entities) < node_limit:
                    next_entity = db.get(GraphEntity, next_id)
                    if next_entity:
                        visited_entities[next_id] = next_entity
                        queue.append((next_id, current_depth + 1))

        return visited_entities, collected_relationships
