"""p27_social_sync_orchestration

Revision ID: p27_social_sync_orchestration
Revises: p26_social_persistence_phase3
Create Date: 2026-10-11 09:30:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p27_social_sync_orchestration"
down_revision = "p26_social_persistence_phase3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. Update social_accounts table
    if "social_accounts" in existing_tables:
        account_columns = [col["name"] for col in inspector.get_columns("social_accounts")]
        account_indexes = [idx["name"] for idx in inspector.get_indexes("social_accounts")]

        if "provider_access_status" not in account_columns:
            op.add_column(
                "social_accounts",
                sa.Column("provider_access_status", sa.String(32), nullable=False, server_default="available"),
            )
        if "next_sync_at" not in account_columns:
            op.add_column(
                "social_accounts",
                sa.Column("next_sync_at", sa.DateTime(timezone=True), nullable=True),
            )
        if "last_sync_requested_at" not in account_columns:
            op.add_column(
                "social_accounts",
                sa.Column("last_sync_requested_at", sa.DateTime(timezone=True), nullable=True),
            )

        if "ix_social_accounts_due_sync" not in account_indexes:
            op.create_index(
                "ix_social_accounts_due_sync",
                "social_accounts",
                ["status", "is_sync_enabled", "provider_access_status", "next_sync_at"],
            )
        if "ix_social_accounts_next_sync_at" not in account_indexes:
            op.create_index(
                "ix_social_accounts_next_sync_at",
                "social_accounts",
                ["next_sync_at"],
            )

    # 2. Update social_sync_runs table
    if "social_sync_runs" in existing_tables:
        run_columns = [col["name"] for col in inspector.get_columns("social_sync_runs")]
        run_indexes = [idx["name"] for idx in inspector.get_indexes("social_sync_runs")]

        if "run_id" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("run_id", sa.String(64), nullable=True))
        if "platform" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("platform", sa.String(32), nullable=False, server_default="YOUTUBE"))
        if "trigger" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("trigger", sa.String(32), nullable=False, server_default="manual"))
        if "items_created" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("items_created", sa.Integer(), nullable=False, server_default="0"))
        if "items_updated" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("items_updated", sa.Integer(), nullable=False, server_default="0"))
        if "items_skipped" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("items_skipped", sa.Integer(), nullable=False, server_default="0"))
        if "items_failed" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("items_failed", sa.Integer(), nullable=False, server_default="0"))
        if "error_code" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("error_code", sa.String(64), nullable=True))
        if "metadata_json" not in run_columns:
            op.add_column("social_sync_runs", sa.Column("metadata_json", json_type, nullable=False, server_default="{}"))

        if "ix_social_sync_runs_run_id" not in run_indexes:
            op.create_index("ix_social_sync_runs_run_id", "social_sync_runs", ["run_id"])
        if "ix_social_sync_runs_account_started" not in run_indexes:
            op.create_index("ix_social_sync_runs_account_started", "social_sync_runs", ["social_account_id", "started_at"])

    # 3. Update social_account_sync_states table
    if "social_account_sync_states" in existing_tables:
        sync_state_cols = [col["name"] for col in inspector.get_columns("social_account_sync_states")]
        if "skipped_count" not in sync_state_cols:
            op.add_column("social_account_sync_states", sa.Column("skipped_count", sa.Integer(), nullable=False, server_default="0"))
        if "last_seen_published_at" not in sync_state_cols:
            op.add_column("social_account_sync_states", sa.Column("last_seen_published_at", sa.DateTime(timezone=True), nullable=True))
        if "last_seen_provider_content_id" not in sync_state_cols:
            op.add_column("social_account_sync_states", sa.Column("last_seen_provider_content_id", sa.String(128), nullable=True))
        if "last_error_code" not in sync_state_cols:
            op.add_column("social_account_sync_states", sa.Column("last_error_code", sa.String(64), nullable=True))

    # 4. Update social_contents table
    if "social_contents" in existing_tables:
        content_cols = [col["name"] for col in inspector.get_columns("social_contents")]
        if "place_name" not in content_cols:
            op.add_column("social_contents", sa.Column("place_name", sa.String(200), nullable=True))

    # 5. Make creators.user_id nullable to match model definition
    if "creators" in existing_tables:
        op.alter_column("creators", "user_id", nullable=True)

    # 6. Align market_leads columns nullability with MarketLead model
    if "market_leads" in existing_tables:
        op.execute("UPDATE market_leads SET traveler_count = 1 WHERE traveler_count IS NULL")
        op.execute("UPDATE market_leads SET qualification_status = 'PENDING' WHERE qualification_status IS NULL")
        op.execute("UPDATE market_leads SET provider_response_status = 'NEW' WHERE provider_response_status IS NULL")
        op.execute("UPDATE market_leads SET updated_at = NOW() WHERE updated_at IS NULL")

        op.alter_column("market_leads", "traveler_segment", nullable=True)
        op.alter_column("market_leads", "destination", nullable=True)
        op.alter_column("market_leads", "experience", nullable=True)
        op.alter_column("market_leads", "traveler_count", nullable=False)
        op.alter_column("market_leads", "qualification_status", nullable=False)
        op.alter_column("market_leads", "provider_response_status", nullable=False)
        op.alter_column("market_leads", "updated_at", nullable=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if "market_leads" in existing_tables:
        op.alter_column("market_leads", "traveler_segment", nullable=False)
        op.alter_column("market_leads", "destination", nullable=False)
        op.alter_column("market_leads", "experience", nullable=False)
        op.alter_column("market_leads", "traveler_count", nullable=True)
        op.alter_column("market_leads", "qualification_status", nullable=True)
        op.alter_column("market_leads", "provider_response_status", nullable=True)
        op.alter_column("market_leads", "updated_at", nullable=True)

    if "creators" in existing_tables:
        op.alter_column("creators", "user_id", nullable=False)

    if "social_contents" in existing_tables:
        content_cols = [col["name"] for col in inspector.get_columns("social_contents")]
        if "place_name" in content_cols:
            op.drop_column("social_contents", "place_name")

    if "social_accounts" in existing_tables:
        indexes = [idx["name"] for idx in inspector.get_indexes("social_accounts")]
        if "ix_social_accounts_due_sync" in indexes:
            op.drop_index("ix_social_accounts_due_sync", table_name="social_accounts")
        if "ix_social_accounts_next_sync_at" in indexes:
            op.drop_index("ix_social_accounts_next_sync_at", table_name="social_accounts")

        columns = [col["name"] for col in inspector.get_columns("social_accounts")]
        if "provider_access_status" in columns:
            op.drop_column("social_accounts", "provider_access_status")
        if "next_sync_at" in columns:
            op.drop_column("social_accounts", "next_sync_at")
        if "last_sync_requested_at" in columns:
            op.drop_column("social_accounts", "last_sync_requested_at")

    if "social_sync_runs" in existing_tables:
        indexes = [idx["name"] for idx in inspector.get_indexes("social_sync_runs")]
        if "ix_social_sync_runs_run_id" in indexes:
            op.drop_index("ix_social_sync_runs_run_id", table_name="social_sync_runs")
        if "ix_social_sync_runs_account_started" in indexes:
            op.drop_index("ix_social_sync_runs_account_started", table_name="social_sync_runs")
