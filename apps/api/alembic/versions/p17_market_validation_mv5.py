"""p17_market_validation_mv5

Revision ID: p17_market_validation_mv5
Revises: p16_market_validation_mv4
Create Date: 2026-09-25 19:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p17_market_validation_mv5"
down_revision = "p16_market_validation_mv4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_content_entries
    op.create_table(
        "market_content_entries",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("content_id", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("content_type", sa.String(50), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False, index=True),
        sa.Column("destination_id", sa.String(100), nullable=True, index=True),
        sa.Column("short_description", sa.Text(), nullable=False),
        sa.Column("long_description", sa.Text(), nullable=True),
        sa.Column("language", sa.String(10), nullable=False, default="en", index=True),
        sa.Column("fields_json", json_type, nullable=True),
        sa.Column("quality_score", sa.Float(), nullable=False, default=0.0),
        sa.Column("quality_breakdown", json_type, nullable=True),
        sa.Column("governance_status", sa.String(50), nullable=False, default="CONTENT_DRAFT", index=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_review_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 2. market_content_evidence
    op.create_table(
        "market_content_evidence",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("content_entry_id", uuid_type, sa.ForeignKey("market_content_entries.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("claim", sa.Text(), nullable=False),
        sa.Column("field_name", sa.String(100), nullable=True),
        sa.Column("source_type", sa.String(50), nullable=False, index=True),
        sa.Column("source_reference", sa.String(255), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verifier", sa.String(100), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False, default=0.8),
        sa.Column("status", sa.String(50), nullable=False, default="UNVERIFIED", index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 3. market_content_trust
    op.create_table(
        "market_content_trust",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("content_entry_id", uuid_type, sa.ForeignKey("market_content_entries.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("source_count", sa.Integer(), nullable=False, default=0),
        sa.Column("verified_sources", sa.Integer(), nullable=False, default=0),
        sa.Column("freshness_score", sa.Float(), nullable=False, default=0.0),
        sa.Column("contradiction_count", sa.Integer(), nullable=False, default=0),
        sa.Column("provider_confirmation", sa.Boolean(), nullable=False, default=False),
        sa.Column("community_confirmation", sa.Boolean(), nullable=False, default=False),
        sa.Column("trust_score", sa.Float(), nullable=False, default=0.0),
        sa.Column("trust_breakdown", json_type, nullable=True),
        sa.Column("last_computed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 4. market_content_experiments
    op.create_table(
        "market_content_experiments",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("experiment_key", sa.String(50), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hypothesis_key", sa.String(50), nullable=False, index=True),
        sa.Column("content_entry_id", sa.String(100), nullable=True, index=True),
        sa.Column("status", sa.String(50), nullable=False, default="DRAFT", index=True),
        sa.Column("control_version", json_type, nullable=False),
        sa.Column("variant_version", json_type, nullable=False),
        sa.Column("audience", sa.String(100), nullable=False, default="ALL_TRAVELERS"),
        sa.Column("primary_metric", sa.String(100), nullable=False),
        sa.Column("secondary_metrics", json_type, nullable=True),
        sa.Column("control_metric_value", sa.Float(), nullable=False, default=0.0),
        sa.Column("variant_metric_value", sa.Float(), nullable=False, default=0.0),
        sa.Column("sample_size_control", sa.Integer(), nullable=False, default=0),
        sa.Column("sample_size_variant", sa.Integer(), nullable=False, default=0),
        sa.Column("lift_percentage", sa.Float(), nullable=False, default=0.0),
        sa.Column("outcome", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 5. market_content_assignments
    op.create_table(
        "market_content_assignments",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("experiment_id", uuid_type, sa.ForeignKey("market_content_experiments.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("anonymous_user_id", sa.String(100), nullable=False, index=True),
        sa.Column("assigned_variant", sa.String(20), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("experiment_id", "anonymous_user_id", name="uq_experiment_user_assignment"),
    )

    # 6. market_discovery_events
    op.create_table(
        "market_discovery_events",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("anonymous_user_id", sa.String(100), nullable=False, index=True),
        sa.Column("session_id", sa.String(100), nullable=False, index=True),
        sa.Column("event_type", sa.String(100), nullable=False, index=True),
        sa.Column("discovery_source", sa.String(50), nullable=False, index=True),
        sa.Column("content_entry_id", sa.String(100), nullable=True, index=True),
        sa.Column("destination_id", sa.String(100), nullable=True, index=True),
        sa.Column("experiment_id", sa.String(50), nullable=True, index=True),
        sa.Column("assigned_variant", sa.String(20), nullable=True),
        sa.Column("metadata_json", json_type, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 7. market_content_performance
    op.create_table(
        "market_content_performance",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("content_entry_id", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("impressions", sa.Integer(), nullable=False, default=0),
        sa.Column("opens", sa.Integer(), nullable=False, default=0),
        sa.Column("engaged_sessions", sa.Integer(), nullable=False, default=0),
        sa.Column("saves", sa.Integer(), nullable=False, default=0),
        sa.Column("shares", sa.Integer(), nullable=False, default=0),
        sa.Column("second_destination_views", sa.Integer(), nullable=False, default=0),
        sa.Column("itinerary_starts", sa.Integer(), nullable=False, default=0),
        sa.Column("itinerary_completions", sa.Integer(), nullable=False, default=0),
        sa.Column("planning_activation_rate", sa.Float(), nullable=False, default=0.0),
        sa.Column("discovery_score", sa.Float(), nullable=False, default=0.0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("market_content_performance")
    op.drop_table("market_discovery_events")
    op.drop_table("market_content_assignments")
    op.drop_table("market_content_experiments")
    op.drop_table("market_content_trust")
    op.drop_table("market_content_evidence")
    op.drop_table("market_content_entries")
