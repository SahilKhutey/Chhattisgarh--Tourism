"""p16_market_validation_mv4

Revision ID: p16_market_validation_mv4
Revises: p15_market_validation_mv3
Create Date: 2026-09-25 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p16_market_validation_mv4"
down_revision = "p15_market_validation_mv3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_geo_validation
    op.create_table(
        "market_geo_validation",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("region_id", sa.String(64), nullable=False),
        sa.Column("zone_id", sa.String(64), nullable=True),
        sa.Column("destination_id", sa.String(64), nullable=False, unique=True),
        sa.Column("destination_name", sa.String(160), nullable=False),
        sa.Column("district", sa.String(64), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("tourism_type", sa.String(64), nullable=False, server_default="GENERAL"),
        sa.Column("validation_status", sa.String(32), nullable=False, server_default="PROVISIONAL"),
        sa.Column("evidence_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.8"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_geo_val_region", "market_geo_validation", ["region_id"])
    op.create_index("ix_market_geo_val_dest", "market_geo_validation", ["destination_id"])
    op.create_index("ix_market_geo_val_status", "market_geo_validation", ["validation_status"])

    # 2. market_geo_relationships
    op.create_table(
        "market_geo_relationships",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("source_destination_id", sa.String(64), nullable=False),
        sa.Column("target_destination_id", sa.String(64), nullable=False),
        sa.Column("relationship_type", sa.String(64), nullable=False),
        sa.Column("straight_line_km", sa.Float(), nullable=True),
        sa.Column("road_distance_km", sa.Float(), nullable=True),
        sa.Column("estimated_travel_minutes", sa.Integer(), nullable=True),
        sa.Column("validation_status", sa.String(32), nullable=False, server_default="PROVISIONAL"),
        sa.Column("evidence_type", sa.String(64), nullable=False, server_default="GEOSPATIAL_CALCULATION"),
        sa.Column("evidence_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.8"),
        sa.Column("source", sa.String(120), nullable=False, server_default="ROUTE_CALCULATION"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_geo_rel_src", "market_geo_relationships", ["source_destination_id"])
    op.create_index("ix_market_geo_rel_tgt", "market_geo_relationships", ["target_destination_id"])
    op.create_index("ix_market_geo_rel_type", "market_geo_relationships", ["relationship_type"])
    op.create_index("ix_market_geo_rel_status", "market_geo_relationships", ["validation_status"])

    # 3. market_geo_experiments
    op.create_table(
        "market_geo_experiments",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("experiment_key", sa.String(64), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("hypothesis_key", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="RUNNING"),
        sa.Column("control_description", sa.Text(), nullable=False),
        sa.Column("variant_description", sa.Text(), nullable=False),
        sa.Column("primary_metric_name", sa.String(64), nullable=False),
        sa.Column("control_metric_value", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("variant_metric_value", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("sample_size_control", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sample_size_variant", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("statistical_significance", sa.Float(), nullable=True),
        sa.Column("outcome", sa.String(120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_geo_exp_key", "market_geo_experiments", ["experiment_key"])
    op.create_index("ix_market_geo_exp_hyp", "market_geo_experiments", ["hypothesis_key"])

    # 4. market_route_validation
    op.create_table(
        "market_route_validation",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("origin", sa.String(120), nullable=False),
        sa.Column("destination", sa.String(120), nullable=False),
        sa.Column("intermediate_places", json_type, nullable=True),
        sa.Column("estimated_duration_minutes", sa.Integer(), nullable=False),
        sa.Column("actual_or_user_estimate_minutes", sa.Integer(), nullable=True),
        sa.Column("travel_mode", sa.String(32), nullable=False, server_default="CAR"),
        sa.Column("feasibility", sa.String(32), nullable=False, server_default="FEASIBLE"),
        sa.Column("participant_id", uuid_type, nullable=True),
        sa.Column("evidence", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_route_orig_dest", "market_route_validation", ["origin", "destination"])
    op.create_index("ix_market_route_feasibility", "market_route_validation", ["feasibility"])

    # 5. market_geo_observations
    op.create_table(
        "market_geo_observations",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("participant_id", uuid_type, nullable=True),
        sa.Column("task_id", sa.String(64), nullable=False),
        sa.Column("source_place_id", sa.String(64), nullable=True),
        sa.Column("target_place_id", sa.String(64), nullable=True),
        sa.Column("relationship_type", sa.String(64), nullable=False),
        sa.Column("expected_relationship", sa.String(64), nullable=True),
        sa.Column("observed_behavior", sa.Text(), nullable=False),
        sa.Column("successful", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("difficulty", sa.Integer(), nullable=False, server_default="2"),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.8"),
        sa.Column("evidence_type", sa.String(64), nullable=False, server_default="USER_OBSERVATION"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_geo_obs_task", "market_geo_observations", ["task_id"])
    op.create_index("ix_market_geo_obs_rel", "market_geo_observations", ["relationship_type"])

    # 6. market_geo_metrics
    op.create_table(
        "market_geo_metrics",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("region_id", sa.String(64), nullable=False, unique=True),
        sa.Column("total_destinations", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_relationships", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("validated_relationships", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("nearby_planning_activation_rate", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("discovery_expansion_rate", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("route_conversion_rate", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("avg_planning_efficiency", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("geographic_utility_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_geo_metrics_region", "market_geo_metrics", ["region_id"])


def downgrade() -> None:
    op.drop_table("market_geo_metrics")
    op.drop_table("market_geo_observations")
    op.drop_table("market_route_validation")
    op.drop_table("market_geo_experiments")
    op.drop_table("market_geo_relationships")
    op.drop_table("market_geo_validation")
