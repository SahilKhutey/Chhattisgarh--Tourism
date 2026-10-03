"""p24_social_aggregation_engine

Revision ID: p24_social_aggregation_engine
Revises: p23_social_feed_subsystem
Create Date: 2026-10-03 09:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p24_social_aggregation_engine"
down_revision = "p23_social_feed_subsystem"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. social_accounts
    if "social_accounts" not in existing_tables:
        op.create_table(
            "social_accounts",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("creator_id", uuid_type, sa.ForeignKey("creators.id", ondelete="CASCADE"), nullable=False),
            sa.Column("platform", sa.String(32), nullable=False, default="YOUTUBE"),
            sa.Column("handle", sa.String(128), nullable=False),
            sa.Column("profile_url", sa.String(512), nullable=True),
            sa.Column("account_type", sa.String(64), nullable=False, default="CREATOR"),
            sa.Column("status", sa.String(32), nullable=False, default="PENDING"),
            sa.Column("is_sync_enabled", sa.Boolean(), nullable=False, default=True),
            sa.Column("sync_frequency_minutes", sa.Integer(), nullable=False, default=60),
            sa.Column("priority", sa.Integer(), nullable=False, default=50),
            sa.Column("content_types_allowed", json_type, nullable=False),
            sa.Column("max_items", sa.Integer(), nullable=False, default=30),
            sa.Column("is_featured", sa.Boolean(), nullable=False, default=False),
            sa.Column("sync_health", sa.String(32), nullable=False, default="HEALTHY"),
            sa.Column("last_successful_sync", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_attempted_sync", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_error", sa.Text(), nullable=True),
            sa.Column("consecutive_failures", sa.Integer(), nullable=False, default=0),
            sa.Column("sync_cursor", sa.String(256), nullable=True),
            sa.Column("metadata_json", json_type, nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.UniqueConstraint("creator_id", "platform", "handle", name="uq_social_account_creator_platform_handle"),
        )
        op.create_index("ix_social_accounts_creator_id", "social_accounts", ["creator_id"])
        op.create_index("ix_social_accounts_platform", "social_accounts", ["platform"])
        op.create_index("ix_social_accounts_handle", "social_accounts", ["handle"])
        op.create_index("ix_social_accounts_status", "social_accounts", ["status"])

    # 2. social_sync_runs
    if "social_sync_runs" not in existing_tables:
        op.create_table(
            "social_sync_runs",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("social_account_id", uuid_type, sa.ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False),
            sa.Column("status", sa.String(32), nullable=False, default="SUCCESS"),
            sa.Column("items_discovered", sa.Integer(), nullable=False, default=0),
            sa.Column("items_synced", sa.Integer(), nullable=False, default=0),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("ix_social_sync_runs_account_id", "social_sync_runs", ["social_account_id"])

    # 3. social_feed_templates
    if "social_feed_templates" not in existing_tables:
        op.create_table(
            "social_feed_templates",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("slug", sa.String(128), nullable=False, unique=True),
            sa.Column("name", sa.String(256), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("layout", sa.String(64), nullable=False, default="STANDARD_GRID"),
            sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
            sa.Column("platforms_allowed", json_type, nullable=False),
            sa.Column("content_types_allowed", json_type, nullable=False),
            sa.Column("districts_allowed", json_type, nullable=False),
            sa.Column("categories_allowed", json_type, nullable=False),
            sa.Column("place_slugs_allowed", json_type, nullable=False),
            sa.Column("max_items", sa.Integer(), nullable=False, default=12),
            sa.Column("columns_desktop", sa.Integer(), nullable=False, default=4),
            sa.Column("columns_tablet", sa.Integer(), nullable=False, default=3),
            sa.Column("columns_mobile", sa.Integer(), nullable=False, default=2),
            sa.Column("show_creator_info", sa.Boolean(), nullable=False, default=True),
            sa.Column("show_location", sa.Boolean(), nullable=False, default=True),
            sa.Column("show_date", sa.Boolean(), nullable=False, default=True),
            sa.Column("sort_strategy", sa.String(32), nullable=False, default="LATEST"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_social_feed_templates_slug", "social_feed_templates", ["slug"])

    # 4. Alter social_contents with aggregation fields
    if "social_contents" in existing_tables:
        content_columns = [col["name"] for col in inspector.get_columns("social_contents")]
        if "social_account_id" not in content_columns:
            op.add_column("social_contents", sa.Column("social_account_id", uuid_type, sa.ForeignKey("social_accounts.id", ondelete="SET NULL"), nullable=True))
            op.create_index("ix_social_contents_social_account_id", "social_contents", ["social_account_id"])
        if "provider" not in content_columns:
            op.add_column("social_contents", sa.Column("provider", sa.String(32), nullable=True))
            op.create_index("ix_social_contents_provider", "social_contents", ["provider"])
        if "provider_content_id" not in content_columns:
            op.add_column("social_contents", sa.Column("provider_content_id", sa.String(128), nullable=True))
            op.create_index("ix_social_contents_provider_and_cid", "social_contents", ["provider", "provider_content_id"])
        if "source_url" not in content_columns:
            op.add_column("social_contents", sa.Column("source_url", sa.String(1024), nullable=True))
        if "original_platform_action_label" not in content_columns:
            op.add_column("social_contents", sa.Column("original_platform_action_label", sa.String(64), nullable=True))
        if "duration_seconds" not in content_columns:
            op.add_column("social_contents", sa.Column("duration_seconds", sa.Integer(), nullable=True))
        if "aspect_ratio" not in content_columns:
            op.add_column("social_contents", sa.Column("aspect_ratio", sa.String(16), nullable=True, default="16:9"))
        if "synced_at" not in content_columns:
            op.add_column("social_contents", sa.Column("synced_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if "social_feed_templates" in existing_tables:
        op.drop_table("social_feed_templates")
    if "social_sync_runs" in existing_tables:
        op.drop_table("social_sync_runs")
    if "social_accounts" in existing_tables:
        op.drop_table("social_accounts")
