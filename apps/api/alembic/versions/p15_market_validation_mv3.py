"""p15_market_validation_mv3

Revision ID: p15_market_validation_mv3
Revises: p14_market_validation_mv2
Create Date: 2026-09-25 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p15_market_validation_mv3"
down_revision = "p14_market_validation_mv2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_providers
    op.create_table(
        "market_providers",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("canonical_provider_id", uuid_type, nullable=True),
        sa.Column("provider_type", sa.String(64), nullable=False),
        sa.Column("segment", sa.String(64), nullable=False),
        sa.Column("business_name", sa.String(160), nullable=False),
        sa.Column("geography", sa.String(120), nullable=False),
        sa.Column("operating_area", sa.String(120), nullable=False),
        sa.Column("verification_status", sa.String(32), nullable=False, server_default="UNVERIFIED"),
        sa.Column("digital_presence", sa.String(64), nullable=False, server_default="BASIC_DIGITAL"),
        sa.Column("acquisition_channels", json_type, nullable=False),
        sa.Column("booking_method", sa.String(64), nullable=False, server_default="WHATSAPP"),
        sa.Column("response_method", sa.String(64), nullable=False, server_default="PHONE"),
        sa.Column("current_demand", sa.String(64), nullable=False, server_default="LOW"),
        sa.Column("desired_demand", sa.String(64), nullable=False, server_default="HIGH"),
        sa.Column("willingness_to_participate", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("willingness_to_pay", sa.String(64), nullable=False, server_default="UNDECIDED"),
        sa.Column("research_status", sa.String(32), nullable=False, server_default="PROSPECT"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_providers_type", "market_providers", ["provider_type"])
    op.create_index("ix_market_providers_geography", "market_providers", ["geography"])
    op.create_index("ix_market_providers_status", "market_providers", ["verification_status"])

    # 2. market_provider_research
    op.create_table(
        "market_provider_research",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("provider_id", uuid_type, sa.ForeignKey("market_providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("researcher_id", sa.String(120), nullable=False),
        sa.Column("interview_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("acquisition_channels", json_type, nullable=True),
        sa.Column("booking_channels", json_type, nullable=True),
        sa.Column("operational_tools", json_type, nullable=True),
        sa.Column("current_pain", sa.Text(), nullable=False),
        sa.Column("desired_outcome", sa.Text(), nullable=False),
        sa.Column("demand_problem", sa.Text(), nullable=True),
        sa.Column("digital_problem", sa.Text(), nullable=True),
        sa.Column("trust_problem", sa.Text(), nullable=True),
        sa.Column("booking_problem", sa.Text(), nullable=True),
        sa.Column("response_problem", sa.Text(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_provider_research_provider", "market_provider_research", ["provider_id"])

    # 3. market_provider_onboarding
    op.create_table(
        "market_provider_onboarding",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("provider_id", uuid_type, sa.ForeignKey("market_providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("current_step", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", sa.String(32), nullable=False, server_default="STARTED"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completion_rate", sa.Float(), nullable=False, server_default="0.14"),
        sa.Column("required_fields_completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("questions_asked", json_type, nullable=True),
        sa.Column("time_to_onboard_seconds", sa.Integer(), nullable=True),
    )
    op.create_index("ix_market_provider_onboarding_provider", "market_provider_onboarding", ["provider_id"])

    # 4. market_provider_listing_experiments
    op.create_table(
        "market_provider_listing_experiments",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("provider_id", uuid_type, sa.ForeignKey("market_providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("template_id", sa.String(64), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="DRAFT"),
        sa.Column("information_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("media_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("location_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("service_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("contact_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("trust_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("listing_quality_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_provider_listings_provider", "market_provider_listing_experiments", ["provider_id"])
    op.create_index("ix_market_provider_listings_status", "market_provider_listing_experiments", ["status"])

    # 5. market_leads
    op.create_table(
        "market_leads",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("provider_id", uuid_type, sa.ForeignKey("market_providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source", sa.String(64), nullable=False, server_default="DISCOVERY"),
        sa.Column("traveler_segment", sa.String(64), nullable=False),
        sa.Column("destination", sa.String(120), nullable=False),
        sa.Column("experience", sa.String(160), nullable=False),
        sa.Column("request_type", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="NEW"),
        sa.Column("qualified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("conversion_status", sa.String(32), nullable=False, server_default="PENDING"),
        sa.Column("outcome", sa.String(120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("provider_response_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("response_time_seconds", sa.Integer(), nullable=True),
    )
    op.create_index("ix_market_leads_provider", "market_leads", ["provider_id"])
    op.create_index("ix_market_leads_status", "market_leads", ["status"])
    op.create_index("ix_market_leads_qualified", "market_leads", ["qualified"])

    # 6. market_provider_feedback
    op.create_table(
        "market_provider_feedback",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("provider_id", uuid_type, sa.ForeignKey("market_providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("journey", sa.String(64), nullable=False),
        sa.Column("feature", sa.String(64), nullable=False),
        sa.Column("sentiment", sa.String(32), nullable=False, server_default="NEUTRAL"),
        sa.Column("problem", sa.Text(), nullable=True),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("willingness_to_continue", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("willingness_to_pay", sa.String(64), nullable=True),
        sa.Column("free_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_provider_feedback_provider", "market_provider_feedback", ["provider_id"])

    # 7. market_provider_metrics
    op.create_table(
        "market_provider_metrics",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("provider_id", uuid_type, sa.ForeignKey("market_providers.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("profile_views", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("contacts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("qualified_leads", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("bookings", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_services", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("estimated_revenue", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("time_saved", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("response_time_avg_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("perceived_value", sa.String(64), nullable=False, server_default="MODERATE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_provider_metrics_provider", "market_provider_metrics", ["provider_id"])


def downgrade() -> None:
    op.drop_table("market_provider_metrics")
    op.drop_table("market_provider_feedback")
    op.drop_table("market_leads")
    op.drop_table("market_provider_listing_experiments")
    op.drop_table("market_provider_onboarding")
    op.drop_table("market_provider_research")
    op.drop_table("market_providers")
