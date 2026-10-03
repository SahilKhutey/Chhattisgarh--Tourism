"""p25_social_persistence_layer

Revision ID: p25_social_persistence_layer
Revises: p24_social_aggregation_engine
Create Date: 2026-10-03 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p25_social_persistence_layer"
down_revision = "p24_social_aggregation_engine"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. Update social_accounts columns & indexes
    if "social_accounts" in existing_tables:
        account_columns = [col["name"] for col in inspector.get_columns("social_accounts")]
        account_indexes = [idx["name"] for idx in inspector.get_indexes("social_accounts")]

        if "display_name" not in account_columns:
            op.add_column("social_accounts", sa.Column("display_name", sa.String(255), nullable=True))

        if "external_account_id" not in account_columns:
            op.add_column("social_accounts", sa.Column("external_account_id", sa.String(128), nullable=True))

        if "sync_status" not in account_columns:
            op.add_column("social_accounts", sa.Column("sync_status", sa.String(32), nullable=False, server_default="never_run"))

        if "ix_social_accounts_external_id" not in account_indexes:
            op.create_index("ix_social_accounts_external_id", "social_accounts", ["external_account_id"])

        if "ix_social_accounts_sync_status" not in account_indexes:
            op.create_index("ix_social_accounts_sync_status", "social_accounts", ["sync_status"])

    # 2. Update social_contents columns
    if "social_contents" in existing_tables:
        content_columns = [col["name"] for col in inspector.get_columns("social_contents")]
        if "thumbnail_url" not in content_columns:
            op.add_column("social_contents", sa.Column("thumbnail_url", sa.String(1024), nullable=True))

        if "metadata_json" not in content_columns:
            op.add_column("social_contents", sa.Column("metadata_json", json_type, nullable=False, server_default="{}"))

    # 3. Create social_account_sync_states table
    if "social_account_sync_states" not in existing_tables:
        op.create_table(
            "social_account_sync_states",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column(
                "social_account_id",
                uuid_type,
                sa.ForeignKey("social_accounts.id", ondelete="CASCADE"),
                nullable=False,
                unique=True,
            ),
            sa.Column("sync_status", sa.String(32), nullable=False, server_default="never_run"),
            sa.Column("sync_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_successful_sync_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("consecutive_failures", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("last_error", sa.Text(), nullable=True),
            sa.Column("cursor", sa.String(256), nullable=True),
            sa.Column("items_synced_total", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index(
            "ix_social_account_sync_states_account_id",
            "social_account_sync_states",
            ["social_account_id"],
            unique=True,
        )
        op.create_index(
            "ix_social_account_sync_states_sync_status",
            "social_account_sync_states",
            ["sync_status"],
        )

    # 4. View alias: social_creators pointing to creators
    if "creators" in existing_tables and "social_creators" not in existing_tables:
        try:
            if is_postgres:
                op.execute("CREATE OR REPLACE VIEW social_creators AS SELECT * FROM creators")
            else:
                op.execute("CREATE VIEW IF NOT EXISTS social_creators AS SELECT * FROM creators")
        except Exception:
            pass


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    try:
        op.execute("DROP VIEW IF EXISTS social_creators")
    except Exception:
        pass

    if "social_account_sync_states" in existing_tables:
        op.drop_table("social_account_sync_states")

    if "social_contents" in existing_tables:
        content_columns = [col["name"] for col in inspector.get_columns("social_contents")]
        if "metadata_json" in content_columns:
            op.drop_column("social_contents", "metadata_json")
        if "thumbnail_url" in content_columns:
            op.drop_column("social_contents", "thumbnail_url")

    if "social_accounts" in existing_tables:
        account_columns = [col["name"] for col in inspector.get_columns("social_accounts")]
        account_indexes = [idx["name"] for idx in inspector.get_indexes("social_accounts")]
        if "ix_social_accounts_sync_status" in account_indexes:
            op.drop_index("ix_social_accounts_sync_status", table_name="social_accounts")
        if "ix_social_accounts_external_id" in account_indexes:
            op.drop_index("ix_social_accounts_external_id", table_name="social_accounts")
        if "sync_status" in account_columns:
            op.drop_column("social_accounts", "sync_status")
        if "external_account_id" in account_columns:
            op.drop_column("social_accounts", "external_account_id")
        if "display_name" in account_columns:
            op.drop_column("social_accounts", "display_name")
