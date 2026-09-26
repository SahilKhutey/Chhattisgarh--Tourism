"""p18_market_validation_mv7

Revision ID: p18_market_validation_mv7
Revises: p17_market_validation_mv5
Create Date: 2026-09-26 07:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p18_market_validation_mv7"
down_revision = "p17_market_validation_mv5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_leads table or column extension
    if "market_leads" in existing_tables:
        existing_cols = [c["name"] for c in inspector.get_columns("market_leads")]
        new_columns = [
            ("lead_id", sa.String(100), True),
            ("consumer_id", sa.String(100), True),
            ("anonymous_user_id", sa.String(100), True),
            ("session_id", sa.String(100), True),
            ("destination_id", sa.String(100), True),
            ("experience_id", sa.String(100), True),
            ("requested_date", sa.DateTime(timezone=True), True),
            ("traveler_count", sa.Integer(), True),
            ("budget_band", sa.String(50), True),
            ("message", sa.Text(), True),
            ("qualification_status", sa.String(50), True),
            ("disqualification_reason", sa.String(100), True),
            ("provider_response_status", sa.String(50), True),
            ("lead_details", json_type, True),
            ("updated_at", sa.DateTime(timezone=True), True),
        ]
        for col_name, col_type, is_nullable in new_columns:
            if col_name not in existing_cols:
                op.add_column("market_leads", sa.Column(col_name, col_type, nullable=is_nullable))
    else:
        op.create_table(
            "market_leads",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("lead_id", sa.String(100), nullable=False, unique=True, index=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("consumer_id", sa.String(100), nullable=True, index=True),
            sa.Column("anonymous_user_id", sa.String(100), nullable=True, index=True),
            sa.Column("session_id", sa.String(100), nullable=True, index=True),
            sa.Column("source", sa.String(50), nullable=False, default="SEARCH", index=True),
            sa.Column("destination_id", sa.String(100), nullable=True, index=True),
            sa.Column("experience_id", sa.String(100), nullable=True, index=True),
            sa.Column("request_type", sa.String(50), nullable=False, default="BOOKING_INQUIRY"),
            sa.Column("requested_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("traveler_count", sa.Integer(), nullable=False, default=1),
            sa.Column("budget_band", sa.String(50), nullable=True),
            sa.Column("message", sa.Text(), nullable=True),
            sa.Column("qualification_status", sa.String(50), nullable=False, default="PENDING", index=True),
            sa.Column("disqualification_reason", sa.String(100), nullable=True),
            sa.Column("provider_response_status", sa.String(50), nullable=False, default="NEW", index=True),
            sa.Column("conversion_status", sa.String(50), nullable=False, default="CONTACT", index=True),
            sa.Column("lead_details", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )

    # 2. market_booking_intents
    if "market_booking_intents" not in existing_tables:
        op.create_table(
            "market_booking_intents",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("intent_id", sa.String(100), nullable=False, unique=True, index=True),
            sa.Column("lead_id", sa.String(100), nullable=False, index=True),
            sa.Column("consumer_id", sa.String(100), nullable=True, index=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("experience_id", sa.String(100), nullable=True, index=True),
            sa.Column("requested_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("traveler_count", sa.Integer(), nullable=False, default=1),
            sa.Column("amount_estimate", sa.Float(), nullable=False, default=0.0),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("status", sa.String(50), nullable=False, default="REQUESTED", index=True),
            sa.Column("idempotency_key", sa.String(100), nullable=True, unique=True, index=True),
            sa.Column("intent_details", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )

    # 3. market_provider_responses
    if "market_provider_responses" not in existing_tables:
        op.create_table(
            "market_provider_responses",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("lead_id", sa.String(100), nullable=False, index=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("response_type", sa.String(50), nullable=False, default="RESPONDED"),
            sa.Column("response_time_seconds", sa.Integer(), nullable=False, default=0),
            sa.Column("response_bucket", sa.String(50), nullable=False, default="NO_RESPONSE"),
            sa.Column("response_message", sa.Text(), nullable=True),
            sa.Column("offered_price", sa.Float(), nullable=True),
            sa.Column("offered_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("responded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )

    # 4. market_conversions
    if "market_conversions" not in existing_tables:
        op.create_table(
            "market_conversions",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("lead_id", sa.String(100), nullable=False, index=True),
            sa.Column("booking_intent_id", sa.String(100), nullable=True, index=True),
            sa.Column("booking_id", sa.String(100), nullable=True, index=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("consumer_id", sa.String(100), nullable=True, index=True),
            sa.Column("conversion_stage", sa.String(50), nullable=False, index=True),
            sa.Column("value", sa.Float(), nullable=False, default=0.0),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("attributed_source", sa.String(50), nullable=False),
            sa.Column("experiment_id", sa.String(100), nullable=True),
            sa.Column("converted_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )

    # 5. market_attributions
    if "market_attributions" not in existing_tables:
        op.create_table(
            "market_attributions",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("booking_id", sa.String(100), nullable=False, index=True),
            sa.Column("lead_id", sa.String(100), nullable=False, index=True),
            sa.Column("anonymous_user_id", sa.String(100), nullable=True),
            sa.Column("session_id", sa.String(100), nullable=True),
            sa.Column("source_event_id", sa.String(100), nullable=True),
            sa.Column("discovery_source", sa.String(50), nullable=False),
            sa.Column("destination_id", sa.String(100), nullable=True),
            sa.Column("experience_id", sa.String(100), nullable=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("campaign_id", sa.String(100), nullable=True),
            sa.Column("experiment_id", sa.String(100), nullable=True),
            sa.Column("attribution_window_days", sa.Integer(), nullable=False, default=30),
            sa.Column("chain_details", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )

    # 6. market_transactions
    if "market_transactions" not in existing_tables:
        op.create_table(
            "market_transactions",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("transaction_id", sa.String(100), nullable=False, unique=True, index=True),
            sa.Column("booking_id", sa.String(100), nullable=False, index=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("consumer_id", sa.String(100), nullable=True, index=True),
            sa.Column("gross_amount", sa.Float(), nullable=False, default=0.0),
            sa.Column("currency", sa.String(10), nullable=False, default="INR"),
            sa.Column("completion_status", sa.String(50), nullable=False, default="SCHEDULED", index=True),
            sa.Column("provider_confirmed", sa.Boolean(), nullable=False, default=False),
            sa.Column("consumer_confirmed", sa.Boolean(), nullable=False, default=False),
            sa.Column("failure_reason", sa.String(50), nullable=True),
            sa.Column("idempotency_key", sa.String(100), nullable=True, unique=True, index=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        )

    # 7. market_transaction_feedback
    if "market_transaction_feedback" not in existing_tables:
        op.create_table(
            "market_transaction_feedback",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("transaction_id", sa.String(100), nullable=False, index=True),
            sa.Column("provider_id", sa.String(100), nullable=False, index=True),
            sa.Column("consumer_id", sa.String(100), nullable=True, index=True),
            sa.Column("feedback_type", sa.String(50), nullable=False),
            sa.Column("lead_quality_score", sa.Float(), nullable=True),
            sa.Column("relevance_score", sa.Float(), nullable=True),
            sa.Column("operational_effort_score", sa.Float(), nullable=True),
            sa.Column("economic_value_score", sa.Float(), nullable=True),
            sa.Column("continuation_intent", sa.Boolean(), nullable=True),
            sa.Column("satisfaction_score", sa.Float(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_table("market_transaction_feedback")
    op.drop_table("market_transactions")
    op.drop_table("market_attributions")
    op.drop_table("market_conversions")
    op.drop_table("market_provider_responses")
    op.drop_table("market_booking_intents")
    # For market_leads, avoid dropping if from MV3
