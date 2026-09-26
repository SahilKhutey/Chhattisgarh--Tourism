"""p20_market_validation_mv9

Revision ID: p20_market_validation_mv9
Revises: p19_market_validation_mv8
Create Date: 2026-09-26 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p20_market_validation_mv9"
down_revision = "p19_market_validation_mv8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_business_models
    if "market_business_models" not in existing_tables:
        op.create_table(
            "market_business_models",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("name", sa.String(100), nullable=False),
            sa.Column("customer_type", sa.String(50), nullable=False, index=True),
            sa.Column("value_proposition", sa.Text(), nullable=False),
            sa.Column("revenue_model", sa.String(50), nullable=False, index=True),
            sa.Column("pricing_model", sa.String(100), nullable=True),
            sa.Column("payment_trigger", sa.String(100), nullable=True),
            sa.Column("cost_structure", sa.Text(), nullable=True),
            sa.Column("assumptions", json_type, nullable=True),
            sa.Column("status", sa.String(50), nullable=False, default="EMERGING"),
            sa.Column("evidence_strength", sa.String(50), nullable=False, default="MODERATE"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 2. market_revenue_streams
    if "market_revenue_streams" not in existing_tables:
        op.create_table(
            "market_revenue_streams",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("business_model_id", sa.String(36), nullable=True, index=True),
            sa.Column("customer_type", sa.String(50), nullable=False, index=True),
            sa.Column("stream_type", sa.String(50), nullable=False, index=True),
            sa.Column("description", sa.String(255), nullable=False),
            sa.Column("value_created", sa.Text(), nullable=True),
            sa.Column("payment_trigger", sa.String(100), nullable=True),
            sa.Column("pricing_unit", sa.String(50), nullable=False),
            sa.Column("base_price", sa.Float(), nullable=False, default=0.0),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("estimated_frequency", sa.String(50), nullable=True),
            sa.Column("estimated_conversion", sa.Float(), nullable=False, default=0.0),
            sa.Column("estimated_margin", sa.Float(), nullable=False, default=0.0),
            sa.Column("status", sa.String(50), nullable=False, default="ACTIVE"),
            sa.Column("evidence_strength", sa.String(50), nullable=False, default="MODERATE"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 3. market_monetization_offers
    if "market_monetization_offers" not in existing_tables:
        op.create_table(
            "market_monetization_offers",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("revenue_stream_id", sa.String(36), nullable=True, index=True),
            sa.Column("target_type", sa.String(50), nullable=False, index=True),
            sa.Column("target_id", sa.String(128), nullable=True),
            sa.Column("offer_title", sa.String(150), nullable=False),
            sa.Column("offer_description", sa.Text(), nullable=True),
            sa.Column("price", sa.Float(), nullable=False, default=0.0),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("billing_cycle", sa.String(50), nullable=False, default="ONE_TIME"),
            sa.Column("features", json_type, nullable=True),
            sa.Column("status", sa.String(50), nullable=False, default="ACTIVE"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 4. market_monetization_orders
    if "market_monetization_orders" not in existing_tables:
        op.create_table(
            "market_monetization_orders",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("offer_id", sa.String(36), nullable=False, index=True),
            sa.Column("customer_type", sa.String(50), nullable=False, index=True),
            sa.Column("customer_id", sa.String(128), nullable=False, index=True),
            sa.Column("amount", sa.Float(), nullable=False),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("status", sa.String(50), nullable=False, default="INITIATED", index=True),
            sa.Column("idempotency_key", sa.String(128), nullable=True, unique=True, index=True),
            sa.Column("variable_cost", sa.Float(), nullable=False, default=0.0),
            sa.Column("contribution_margin", sa.Float(), nullable=False, default=0.0),
            sa.Column("refund_amount", sa.Float(), nullable=False, default=0.0),
            sa.Column("refund_reason", sa.String(255), nullable=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 5. market_pricing_experiments
    if "market_pricing_experiments" not in existing_tables:
        op.create_table(
            "market_pricing_experiments",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("revenue_stream_id", sa.String(36), nullable=True, index=True),
            sa.Column("customer_type", sa.String(50), nullable=False, index=True),
            sa.Column("experiment_type", sa.String(50), nullable=False, index=True),
            sa.Column("control_price", sa.Float(), nullable=False),
            sa.Column("variant_prices", json_type, nullable=False),
            sa.Column("eligibility_rule", sa.String(100), nullable=True),
            sa.Column("start_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("primary_metric", sa.String(100), nullable=False),
            sa.Column("secondary_metrics", json_type, nullable=True),
            sa.Column("status", sa.String(50), nullable=False, default="ACTIVE"),
            sa.Column("decision", sa.String(50), nullable=False, default="INCONCLUSIVE"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 6. market_business_experiment_observations
    if "market_business_experiment_observations" not in existing_tables:
        op.create_table(
            "market_business_experiment_observations",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("experiment_id", sa.String(36), nullable=False, index=True),
            sa.Column("participant_id", sa.String(128), nullable=False, index=True),
            sa.Column("variant", sa.String(50), nullable=False),
            sa.Column("offer", sa.String(100), nullable=True),
            sa.Column("observed_action", sa.String(50), nullable=False),
            sa.Column("price", sa.Float(), nullable=False, default=0.0),
            sa.Column("committed", sa.Boolean(), nullable=False, default=False),
            sa.Column("paid", sa.Boolean(), nullable=False, default=False),
            sa.Column("outcome", sa.String(100), nullable=True),
            sa.Column("evidence", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 7. market_willingness_to_pay
    if "market_willingness_to_pay" not in existing_tables:
        op.create_table(
            "market_willingness_to_pay",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("participant_type", sa.String(50), nullable=False, index=True),
            sa.Column("participant_id", sa.String(128), nullable=False, index=True),
            sa.Column("offer_id", sa.String(64), nullable=True, index=True),
            sa.Column("price", sa.Float(), nullable=False, default=0.0),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("response_type", sa.String(50), nullable=False, default="INTERESTED"),
            sa.Column("committed", sa.Boolean(), nullable=False, default=False),
            sa.Column("payment_attempted", sa.Boolean(), nullable=False, default=False),
            sa.Column("purchased", sa.Boolean(), nullable=False, default=False),
            sa.Column("rejected_reason", sa.String(255), nullable=True),
            sa.Column("experiment_id", sa.String(36), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 8. market_unit_economics
    if "market_unit_economics" not in existing_tables:
        op.create_table(
            "market_unit_economics",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("segment", sa.String(50), nullable=False, index=True),
            sa.Column("period", sa.String(50), nullable=False),
            sa.Column("spend", sa.Float(), nullable=False, default=0.0),
            sa.Column("acquired_users", sa.Integer(), nullable=False, default=0),
            sa.Column("activated_users", sa.Integer(), nullable=False, default=0),
            sa.Column("paying_users", sa.Integer(), nullable=False, default=0),
            sa.Column("cac", sa.Float(), nullable=False, default=0.0),
            sa.Column("activated_cac", sa.Float(), nullable=False, default=0.0),
            sa.Column("arpu", sa.Float(), nullable=False, default=0.0),
            sa.Column("variable_cost_per_user", sa.Float(), nullable=False, default=0.0),
            sa.Column("contribution_margin", sa.Float(), nullable=False, default=0.0),
            sa.Column("expected_lifespan_cycles", sa.Float(), nullable=False, default=1.0),
            sa.Column("ltv", sa.Float(), nullable=False, default=0.0),
            sa.Column("ltv_cac_ratio", sa.Float(), nullable=False, default=0.0),
            sa.Column("payback_period_months", sa.Float(), nullable=False, default=0.0),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 9. market_monetization_policies
    if "market_monetization_policies" not in existing_tables:
        op.create_table(
            "market_monetization_policies",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("revenue_model", sa.String(50), nullable=False, index=True),
            sa.Column("eligible_surface", sa.String(100), nullable=False),
            sa.Column("ranking_influence", sa.String(50), nullable=False, default="NONE"),
            sa.Column("disclosure_required", sa.Boolean(), nullable=False, default=True),
            sa.Column("user_impact", sa.String(255), nullable=True),
            sa.Column("trust_risk", sa.Float(), nullable=False, default=0.0),
            sa.Column("approval_status", sa.String(50), nullable=False, default="APPROVED"),
            sa.Column("approved_by", sa.String(100), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    op.drop_table("market_monetization_policies")
    op.drop_table("market_unit_economics")
    op.drop_table("market_willingness_to_pay")
    op.drop_table("market_business_experiment_observations")
    op.drop_table("market_pricing_experiments")
    op.drop_table("market_monetization_orders")
    op.drop_table("market_monetization_offers")
    op.drop_table("market_revenue_streams")
    op.drop_table("market_business_models")
