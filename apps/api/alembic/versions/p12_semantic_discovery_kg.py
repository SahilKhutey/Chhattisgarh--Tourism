"""add semantic discovery and tourism knowledge graph infrastructure

Revision ID: p12_semantic_discovery_kg
Revises: p11_search_discovery
Create Date: 2026-09-12 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

revision = "p12_semantic_discovery_kg"
down_revision = "p11_search_discovery"
branch_labels = None
depends_on = None

EMBEDDING_DIMENSION = 1024


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. embedding_models
    op.create_table(
        "embedding_models",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("model_name", sa.String(255), nullable=False),
        sa.Column("model_version", sa.String(100), nullable=False),
        sa.Column("dimension", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 2. content_embeddings
    op.create_table(
        "content_embeddings",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column(
            "content_entry_id",
            uuid_type,
            sa.ForeignKey("content_entries.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "model_id",
            uuid_type,
            sa.ForeignKey("embedding_models.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en"),
        sa.Column("embedding", Vector(EMBEDDING_DIMENSION), nullable=False),
        sa.Column("source_hash", sa.String(64), nullable=False),
        sa.Column("content_version", sa.String(100), nullable=False, server_default="1.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint(
            "content_entry_id",
            "locale",
            "model_id",
            name="uq_content_embedding_entry_locale_model",
        ),
    )
    op.create_index(
        "idx_content_embedding_entry",
        "content_embeddings",
        ["content_entry_id"],
    )

    if is_postgres:
        op.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_content_embeddings_vector
            ON content_embeddings
            USING hnsw (embedding vector_cosine_ops);
            """
        )

    # 3. graph_entities
    op.create_table(
        "graph_entities",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("entity_type", sa.String(80), nullable=False),
        sa.Column("canonical_name", sa.String(300), nullable=False),
        sa.Column("slug", sa.String(180), nullable=False),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en"),
        sa.Column("aliases", json_type, nullable=False, server_default="[]"),
        sa.Column("metadata", json_type, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint(
            "entity_type",
            "slug",
            "locale",
            name="uq_graph_entity_type_slug_locale",
        ),
    )
    op.create_index(
        "idx_graph_entity_type",
        "graph_entities",
        ["entity_type"],
    )
    op.create_index(
        "idx_graph_entity_slug",
        "graph_entities",
        ["slug"],
    )

    # 4. graph_relationships
    op.create_table(
        "graph_relationships",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("source_entity_id", uuid_type, nullable=False),
        sa.Column("relationship_type", sa.String(100), nullable=False),
        sa.Column("target_entity_id", uuid_type, nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("source", sa.String(50), nullable=False, server_default="CONTENT_FIELD"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint(
            "source_entity_id",
            "relationship_type",
            "target_entity_id",
            name="uq_graph_rel_source_type_target",
        ),
    )
    op.create_index(
        "idx_graph_rel_source",
        "graph_relationships",
        ["source_entity_id"],
    )
    op.create_index(
        "idx_graph_rel_target",
        "graph_relationships",
        ["target_entity_id"],
    )
    op.create_index(
        "idx_graph_rel_type",
        "graph_relationships",
        ["relationship_type"],
    )

    # 5. entity_aliases
    op.create_table(
        "entity_aliases",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("entity_id", uuid_type, sa.ForeignKey("graph_entities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("alias", sa.String(300), nullable=False),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en"),
        sa.Column("normalized_alias", sa.String(300), nullable=False),
        sa.Column("entity_type", sa.String(80), nullable=False),
        sa.UniqueConstraint(
            "locale",
            "normalized_alias",
            "entity_type",
            name="uq_entity_alias_locale_norm_type",
        ),
    )
    op.create_index(
        "idx_entity_alias_lookup",
        "entity_aliases",
        ["locale", "normalized_alias"],
    )


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    op.drop_table("entity_aliases")
    op.drop_table("graph_relationships")
    op.drop_table("graph_entities")
    if is_postgres:
        op.execute("DROP INDEX IF EXISTS idx_content_embeddings_vector")
    op.drop_table("content_embeddings")
    op.drop_table("embedding_models")
