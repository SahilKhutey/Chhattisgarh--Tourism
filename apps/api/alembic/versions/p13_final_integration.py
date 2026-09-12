"""final integration outbox discovery indexes

Revision ID: p13_final_integration
Revises: p12_semantic_discovery_kg
Create Date: 2026-09-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p13_final_integration"
down_revision = "p12_semantic_discovery_kg"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. Create outbox_events table
    op.create_table(
        "outbox_events",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("event_type", sa.String(120), nullable=False),
        sa.Column("aggregate_id", uuid_type, nullable=False),
        sa.Column("payload", json_type, nullable=False),
        sa.Column("processed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
    )

    op.create_index("ix_outbox_events_event_type", "outbox_events", ["event_type"])
    op.create_index("ix_outbox_events_aggregate_id", "outbox_events", ["aggregate_id"])
    op.create_index("ix_outbox_events_processed", "outbox_events", ["processed"])
    op.create_index("idx_outbox_unprocessed", "outbox_events", ["processed", "created_at"])

    # 2. Add performance & integrity indexes on existing tables
    # Check / safely create indexes if not exist
    try:
        op.create_index(
            "idx_template_versions_template",
            "template_versions",
            ["template_id"],
            if_not_exists=True if is_postgres else False,
        )
    except Exception:
        pass

    try:
        op.create_index(
            "idx_content_entries_template_status",
            "content_entries",
            ["template_id", "status"],
            if_not_exists=True if is_postgres else False,
        )
    except Exception:
        pass

    try:
        op.create_index(
            "idx_content_entries_version",
            "content_entries",
            ["template_version_id"],
            if_not_exists=True if is_postgres else False,
        )
    except Exception:
        pass

    try:
        op.create_index(
            "idx_content_entries_status_slug",
            "content_entries",
            ["status", "slug"],
            if_not_exists=True if is_postgres else False,
        )
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_index("idx_content_entries_status_slug", table_name="content_entries")
        op.drop_index("idx_content_entries_version", table_name="content_entries")
        op.drop_index("idx_content_entries_template_status", table_name="content_entries")
        op.drop_index("idx_template_versions_template", table_name="template_versions")
    except Exception:
        pass

    op.drop_index("idx_outbox_unprocessed", table_name="outbox_events")
    op.drop_index("ix_outbox_events_processed", table_name="outbox_events")
    op.drop_index("ix_outbox_events_aggregate_id", table_name="outbox_events")
    op.drop_index("ix_outbox_events_event_type", table_name="outbox_events")
    op.drop_table("outbox_events")
