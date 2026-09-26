"""p21_market_validation_mv11

Revision ID: p21_market_validation_mv11
Revises: p20_market_validation_mv9
Create Date: 2026-09-26 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p21_market_validation_mv11"
down_revision = "p20_market_validation_mv9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. validation_pilots
    if "validation_pilots" not in existing_tables:
        op.create_table(
            "validation_pilots",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("name", sa.String(150), nullable=False),
            sa.Column("validation_decision_id", sa.String(36), nullable=False, index=True),
            sa.Column("status", sa.String(50), nullable=False, default="DRAFT", index=True),
            sa.Column("version", sa.Integer(), nullable=False, default=1),
            sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("geography_scope", json_type, nullable=True),
            sa.Column("consumer_segments", json_type, nullable=True),
            sa.Column("provider_segments", json_type, nullable=True),
            sa.Column("destination_ids", json_type, nullable=True),
            sa.Column("provider_ids", json_type, nullable=True),
            sa.Column("experience_ids", json_type, nullable=True),
            sa.Column("product_scope", json_type, nullable=True),
            sa.Column("success_metrics", json_type, nullable=True),
            sa.Column("failure_metrics", json_type, nullable=True),
            sa.Column("minimum_sample", sa.Integer(), nullable=False, default=50),
            sa.Column("target_sample", sa.Integer(), nullable=False, default=200),
            sa.Column("budget_band", sa.String(50), nullable=False, default="PILOT_TIER_1"),
            sa.Column("operational_capacity", json_type, nullable=True),
            sa.Column("launch_owner", sa.String(100), nullable=False, default="PRODUCT_LEADER"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 2. market_candidates
    if "market_candidates" not in existing_tables:
        op.create_table(
            "market_candidates",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("geography_id", sa.String(100), nullable=False, index=True),
            sa.Column("demand_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("supply_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("content_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("geographic_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("accessibility_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("operational_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("risk_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("evidence_strength", sa.String(50), nullable=False, default="MODERATE"),
            sa.Column("pilot_priority", sa.Integer(), nullable=False, default=1),
            sa.Column("recommendation", sa.String(100), nullable=False, default="RECOMMENDED_PILOT"),
            sa.Column("evidence_ids", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 3. launch_readiness_assessments
    if "launch_readiness_assessments" not in existing_tables:
        op.create_table(
            "launch_readiness_assessments",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("product_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("content_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("geography_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("supply_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("consumer_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("transaction_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("analytics_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("support_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("security_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("privacy_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("safety_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("operational_ready", sa.Boolean(), nullable=False, default=False),
            sa.Column("blockers", json_type, nullable=True),
            sa.Column("warnings", json_type, nullable=True),
            sa.Column("overall_status", sa.String(50), nullable=False, default="NOT_READY"),
            sa.Column("assessed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 4. pilot_metrics
    if "pilot_metrics" not in existing_tables:
        op.create_table(
            "pilot_metrics",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("metric_name", sa.String(100), nullable=False, index=True),
            sa.Column("metric_type", sa.String(50), nullable=False),
            sa.Column("baseline", sa.Float(), nullable=False, default=0.0),
            sa.Column("target", sa.Float(), nullable=False, default=0.0),
            sa.Column("warning_threshold", sa.Float(), nullable=False, default=0.0),
            sa.Column("failure_threshold", sa.Float(), nullable=False, default=0.0),
            sa.Column("current_value", sa.Float(), nullable=False, default=0.0),
            sa.Column("sample_size", sa.Integer(), nullable=False, default=0),
            sa.Column("status", sa.String(50), nullable=False, default="NOT_STARTED"),
            sa.Column("measured_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 5. launch_controls
    if "launch_controls" not in existing_tables:
        op.create_table(
            "launch_controls",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("control_type", sa.String(50), nullable=False, index=True),
            sa.Column("name", sa.String(100), nullable=False),
            sa.Column("enabled", sa.Boolean(), nullable=False, default=True),
            sa.Column("threshold", sa.Float(), nullable=False, default=0.0),
            sa.Column("current_value", sa.Float(), nullable=False, default=0.0),
            sa.Column("action", sa.String(100), nullable=False),
            sa.Column("owner", sa.String(100), nullable=False, default="SYSTEM"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 6. operational_readiness
    if "operational_readiness" not in existing_tables:
        op.create_table(
            "operational_readiness",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("support_capacity", json_type, nullable=True),
            sa.Column("content_operations", json_type, nullable=True),
            sa.Column("provider_operations", json_type, nullable=True),
            sa.Column("technical_operations", json_type, nullable=True),
            sa.Column("incident_response", json_type, nullable=True),
            sa.Column("monitoring", json_type, nullable=True),
            sa.Column("escalation", json_type, nullable=True),
            sa.Column("founder_dependency_metrics", json_type, nullable=True),
            sa.Column("readiness_status", sa.String(50), nullable=False, default="NOT_READY"),
            sa.Column("assessed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 7. scale_gates
    if "scale_gates" not in existing_tables:
        op.create_table(
            "scale_gates",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("gate_name", sa.String(100), nullable=False, index=True),
            sa.Column("requirement", sa.String(255), nullable=False),
            sa.Column("metric", sa.String(100), nullable=False),
            sa.Column("threshold", sa.Float(), nullable=False, default=0.0),
            sa.Column("actual_value", sa.Float(), nullable=False, default=0.0),
            sa.Column("status", sa.String(50), nullable=False, default="PENDING"),
            sa.Column("blocker", sa.Boolean(), nullable=False, default=True),
            sa.Column("evidence_ids", json_type, nullable=True),
            sa.Column("evaluated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 8. expansion_candidates
    if "expansion_candidates" not in existing_tables:
        op.create_table(
            "expansion_candidates",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("current_market_id", sa.String(100), nullable=False, index=True),
            sa.Column("candidate_market_id", sa.String(100), nullable=False, index=True),
            sa.Column("similarity_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("demand_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("supply_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("geographic_fit", sa.Float(), nullable=False, default=0.0),
            sa.Column("operational_fit", sa.Float(), nullable=False, default=0.0),
            sa.Column("economic_fit", sa.Float(), nullable=False, default=0.0),
            sa.Column("expansion_risk", sa.Float(), nullable=False, default=0.0),
            sa.Column("recommendation", sa.String(100), nullable=False, default="RECOMMENDED_NEXT_EXPANSION"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 9. pilot_cohorts
    if "pilot_cohorts" not in existing_tables:
        op.create_table(
            "pilot_cohorts",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("cohort_name", sa.String(100), nullable=False),
            sa.Column("acquisition_channel", sa.String(50), nullable=False),
            sa.Column("consumer_segment", sa.String(50), nullable=False),
            sa.Column("geography", sa.String(100), nullable=False),
            sa.Column("language", sa.String(20), nullable=False, default="hi"),
            sa.Column("device", sa.String(50), nullable=False, default="MOBILE"),
            sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("users", sa.Integer(), nullable=False, default=0),
            sa.Column("activated_users", sa.Integer(), nullable=False, default=0),
            sa.Column("planners", sa.Integer(), nullable=False, default=0),
            sa.Column("leads", sa.Integer(), nullable=False, default=0),
            sa.Column("bookings", sa.Integer(), nullable=False, default=0),
            sa.Column("completed_experiences", sa.Integer(), nullable=False, default=0),
            sa.Column("returning_users", sa.Integer(), nullable=False, default=0),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 10. pilot_audit_events
    if "pilot_audit_events" not in existing_tables:
        op.create_table(
            "pilot_audit_events",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("pilot_id", sa.String(36), nullable=False, index=True),
            sa.Column("event_type", sa.String(100), nullable=False, index=True),
            sa.Column("actor_id", sa.String(128), nullable=False),
            sa.Column("actor_role", sa.String(50), nullable=False),
            sa.Column("details", json_type, nullable=True),
            sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    op.drop_table("pilot_audit_events")
    op.drop_table("pilot_cohorts")
    op.drop_table("expansion_candidates")
    op.drop_table("scale_gates")
    op.drop_table("operational_readiness")
    op.drop_table("launch_controls")
    op.drop_table("pilot_metrics")
    op.drop_table("launch_readiness_assessments")
    op.drop_table("market_candidates")
    op.drop_table("validation_pilots")
