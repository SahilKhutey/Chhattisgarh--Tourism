"""p26_social_persistence_phase3

Revision ID: p26_social_persistence_phase3
Revises: p25_social_persistence_layer
Create Date: 2026-10-10 11:30:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p26_social_persistence_phase3"
down_revision = "p25_social_persistence_layer"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. Update creators with metadata_json
    if "creators" in existing_tables:
        creator_columns = [col["name"] for col in inspector.get_columns("creators")]
        if "metadata_json" not in creator_columns:
            op.add_column("creators", sa.Column("metadata_json", json_type, nullable=False, server_default="{}"))

    # 2. Update social_accounts columns & indexes
    if "social_accounts" in existing_tables:
        account_columns = [col["name"] for col in inspector.get_columns("social_accounts")]
        account_indexes = [idx["name"] for idx in inspector.get_indexes("social_accounts")]

        if "version" not in account_columns:
            op.add_column("social_accounts", sa.Column("version", sa.Integer(), nullable=False, server_default="1"))

        if "idx_social_account_platform_profile" not in account_indexes:
            op.create_index("idx_social_account_platform_profile", "social_accounts", ["platform", "profile_url"])

        if "uq_social_account_external_identity" not in account_indexes:
            try:
                op.create_index(
                    "uq_social_account_external_identity",
                    "social_accounts",
                    ["platform", "external_account_id"],
                    unique=True,
                    postgresql_where=sa.text("external_account_id IS NOT NULL"),
                    sqlite_where=sa.text("external_account_id IS NOT NULL"),
                )
            except Exception:
                pass

    # 3. Create social_account_verifications table
    if "social_account_verifications" not in existing_tables:
        op.create_table(
            "social_account_verifications",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column(
                "social_account_id",
                uuid_type,
                sa.ForeignKey("social_accounts.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column("status", sa.String(40), nullable=False),
            sa.Column("provider_account_id", sa.String(255), nullable=True),
            sa.Column("provider_handle", sa.String(255), nullable=True),
            sa.Column("provider_display_name", sa.String(255), nullable=True),
            sa.Column("verified_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("details", json_type, nullable=False, server_default="{}"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index(
            "ix_verifications_account_id",
            "social_account_verifications",
            ["social_account_id"],
        )
        op.create_index(
            "ix_verifications_status",
            "social_account_verifications",
            ["status"],
        )
        op.create_index(
            "ix_verifications_created_at",
            "social_account_verifications",
            ["created_at"],
        )

    # 4. Update social_account_sync_states columns
    if "social_account_sync_states" in existing_tables:
        sync_columns = [col["name"] for col in inspector.get_columns("social_account_sync_states")]
        if "last_started_at" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("last_started_at", sa.DateTime(timezone=True), nullable=True))
        if "last_finished_at" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("last_finished_at", sa.DateTime(timezone=True), nullable=True))
        if "etag" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("etag", sa.String(512), nullable=True))
        if "discovered_count" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("discovered_count", sa.Integer(), nullable=False, server_default="0"))
        if "created_count" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("created_count", sa.Integer(), nullable=False, server_default="0"))
        if "updated_count" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("updated_count", sa.Integer(), nullable=False, server_default="0"))
        if "failed_count" not in sync_columns:
            op.add_column("social_account_sync_states", sa.Column("failed_count", sa.Integer(), nullable=False, server_default="0"))

    # 5. Create social_content_context table
    if "social_content_context" not in existing_tables:
        op.create_table(
            "social_content_context",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column(
                "social_content_id",
                uuid_type,
                sa.ForeignKey("social_contents.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column("context_type", sa.String(40), nullable=False),
            sa.Column("context_id", sa.String(100), nullable=False),
            sa.Column("source", sa.String(32), nullable=False, server_default="admin"),
            sa.Column("confidence", sa.Float(), nullable=False, server_default="1.0"),
            sa.Column("metadata_json", json_type, nullable=False, server_default="{}"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index(
            "ix_social_content_context_content_id",
            "social_content_context",
            ["social_content_id"],
        )
        op.create_index(
            "ix_social_content_context_type_id",
            "social_content_context",
            ["context_type", "context_id"],
        )

    # 6. Update social_contents indexes
    if "social_contents" in existing_tables:
        content_indexes = [idx["name"] for idx in inspector.get_indexes("social_contents")]
        if "uq_social_content_provider_identity" not in content_indexes:
            try:
                op.create_index(
                    "uq_social_content_provider_identity",
                    "social_contents",
                    ["provider", "provider_content_id"],
                    unique=True,
                    postgresql_where=sa.text("provider_content_id IS NOT NULL"),
                    sqlite_where=sa.text("provider_content_id IS NOT NULL"),
                )
            except Exception:
                pass

        if "idx_social_content_feed" not in content_indexes:
            try:
                op.create_index(
                    "idx_social_content_feed",
                    "social_contents",
                    ["publication_status", "visibility", "created_at"],
                )
            except Exception:
                pass

        if "idx_social_content_region" not in content_indexes:
            try:
                op.create_index(
                    "idx_social_content_region",
                    "social_contents",
                    ["publication_status", "district_id", "created_at"],
                )
            except Exception:
                pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if "social_contents" in existing_tables:
        content_indexes = [idx["name"] for idx in inspector.get_indexes("social_contents")]
        if "idx_social_content_region" in content_indexes:
            op.drop_index("idx_social_content_region", table_name="social_contents")
        if "idx_social_content_feed" in content_indexes:
            op.drop_index("idx_social_content_feed", table_name="social_contents")
        if "uq_social_content_provider_identity" in content_indexes:
            op.drop_index("uq_social_content_provider_identity", table_name="social_contents")

    if "social_content_context" in existing_tables:
        op.drop_table("social_content_context")

    if "social_account_sync_states" in existing_tables:
        sync_columns = [col["name"] for col in inspector.get_columns("social_account_sync_states")]
        for col_name in ["failed_count", "updated_count", "created_count", "discovered_count", "etag", "last_finished_at", "last_started_at"]:
            if col_name in sync_columns:
                op.drop_column("social_account_sync_states", col_name)

    if "social_account_verifications" in existing_tables:
        op.drop_table("social_account_verifications")

    if "social_accounts" in existing_tables:
        account_indexes = [idx["name"] for idx in inspector.get_indexes("social_accounts")]
        account_columns = [col["name"] for col in inspector.get_columns("social_accounts")]
        if "uq_social_account_external_identity" in account_indexes:
            op.drop_index("uq_social_account_external_identity", table_name="social_accounts")
        if "idx_social_account_platform_profile" in account_indexes:
            op.drop_index("idx_social_account_platform_profile", table_name="social_accounts")
        if "version" in account_columns:
            op.drop_column("social_accounts", "version")

    if "creators" in existing_tables:
        creator_columns = [col["name"] for col in inspector.get_columns("creators")]
        if "metadata_json" in creator_columns:
            op.drop_column("creators", "metadata_json")
