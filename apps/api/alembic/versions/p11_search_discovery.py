"""add search discovery infrastructure

Revision ID: p11_search_discovery
Revises: p10_public_content_indexes
Create Date: 2026-09-11 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p11_search_discovery"
down_revision = "p10_public_content_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. search_documents
    op.create_table(
        "search_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("content_entry_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("template_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("template_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("searchable_text", sa.Text(), nullable=False, server_default=""),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("district", sa.String(length=150), nullable=True),
        sa.Column("categories", json_type, nullable=False, server_default="[]"),
        sa.Column("tags", json_type, nullable=False, server_default="[]"),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("quality_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("popularity_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("content_entry_id", "locale", name="uq_search_document_entry_locale"),
    )
    op.create_index("idx_search_documents_slug", "search_documents", ["slug"])
    op.create_index("idx_search_documents_template", "search_documents", ["template_id"])
    op.create_index("idx_search_documents_content_type", "search_documents", ["content_type"])
    op.create_index("idx_search_documents_district", "search_documents", ["district"])
    op.create_index("idx_search_documents_locale", "search_documents", ["locale"])
    op.create_index("idx_search_documents_entry_id", "search_documents", ["content_entry_id"])

    # 2. taxonomy_terms
    op.create_table(
        "taxonomy_terms",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("taxonomy_terms.id", ondelete="CASCADE"), nullable=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("locale", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("type", sa.String(length=50), nullable=False, server_default="category"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="ACTIVE"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("locale", "slug", name="uq_taxonomy_term_locale_slug"),
    )
    op.create_index("idx_taxonomy_terms_type", "taxonomy_terms", ["type"])

    # 3. search_synonyms
    op.create_table(
        "search_synonyms",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("term", sa.String(length=100), nullable=False),
        sa.Column("synonym", sa.String(length=100), nullable=False),
        sa.Column("locale", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_search_synonyms_term", "search_synonyms", ["term"])
    op.create_index("idx_search_synonyms_locale", "search_synonyms", ["locale"])

    # 4. search_events
    op.create_table(
        "search_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("query_hash", sa.String(length=64), nullable=False),
        sa.Column("query_text", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("locale", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("event_type", sa.String(length=50), nullable=False, server_default="SEARCH_PERFORMED"),
        sa.Column("result_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("selected_result_id", sa.String(length=36), nullable=True),
        sa.Column("filters", json_type, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_search_events_type", "search_events", ["event_type"])
    op.create_index("idx_search_events_hash", "search_events", ["query_hash"])
    op.create_index("idx_search_events_created_at", "search_events", ["created_at"])

    # 5. GIN FTS and Trigram Indexes on PostgreSQL
    if is_postgres:
        op.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_search_documents_fts
            ON search_documents
            USING GIN (
                to_tsvector(
                    'simple',
                    coalesce(title, '') || ' ' ||
                    coalesce(description, '') || ' ' ||
                    coalesce(searchable_text, '')
                )
            )
            """
        )
        op.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_search_documents_title_trgm
            ON search_documents
            USING GIN (title gin_trgm_ops)
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        op.execute("DROP INDEX IF EXISTS idx_search_documents_title_trgm")
        op.execute("DROP INDEX IF EXISTS idx_search_documents_fts")

    op.drop_table("search_events")
    op.drop_table("search_synonyms")
    op.drop_table("taxonomy_terms")
    op.drop_table("search_documents")
