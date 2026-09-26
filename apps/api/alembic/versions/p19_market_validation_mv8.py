"""p19_market_validation_mv8

Revision ID: p19_market_validation_mv8
Revises: p18_market_validation_mv7
Create Date: 2026-09-26 07:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p19_market_validation_mv8"
down_revision = "p18_market_validation_mv7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_consumer_retention
    if "market_consumer_retention" not in existing_tables:
        op.create_table(
            "market_consumer_retention",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("anonymous_user_id", sa.String(128), nullable=False, index=True, unique=True),
            sa.Column("retention_state", sa.String(50), nullable=False, default="DISCOVERED"),
            sa.Column("first_meaningful_action", sa.String(100), nullable=True),
            sa.Column("first_meaningful_action_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("first_trip_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("first_completed_experience_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_meaningful_action", sa.String(100), nullable=True),
            sa.Column("last_meaningful_action_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("meaningful_sessions", sa.Integer(), nullable=False, default=1),
            sa.Column("trips_created", sa.Integer(), nullable=False, default=0),
            sa.Column("trips_completed", sa.Integer(), nullable=False, default=0),
            sa.Column("destinations_explored", json_type, nullable=True),
            sa.Column("reviews_created", sa.Integer(), nullable=False, default=0),
            sa.Column("shares", sa.Integer(), nullable=False, default=0),
            sa.Column("referrals", sa.Integer(), nullable=False, default=0),
            sa.Column("next_trip_started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("cohort_id", sa.String(36), nullable=True, index=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 2. market_retention_cohorts
    if "market_retention_cohorts" not in existing_tables:
        op.create_table(
            "market_retention_cohorts",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("cohort_date", sa.Date(), nullable=False, index=True),
            sa.Column("acquisition_source", sa.String(50), nullable=False, index=True),
            sa.Column("first_action", sa.String(100), nullable=True),
            sa.Column("first_destination", sa.String(100), nullable=True),
            sa.Column("segment", sa.String(50), nullable=True),
            sa.Column("traveler_type", sa.String(50), nullable=True),
            sa.Column("geography", sa.String(50), nullable=True),
            sa.Column("cohort_size", sa.Integer(), nullable=False, default=0),
            sa.Column("d1_retained", sa.Integer(), nullable=False, default=0),
            sa.Column("d7_retained", sa.Integer(), nullable=False, default=0),
            sa.Column("d30_retained", sa.Integer(), nullable=False, default=0),
            sa.Column("trip_cycle_retained", sa.Integer(), nullable=False, default=0),
            sa.Column("next_trip_count", sa.Integer(), nullable=False, default=0),
            sa.Column("destinations_expanded_count", sa.Integer(), nullable=False, default=0),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 3. market_referrals
    if "market_referrals" not in existing_tables:
        op.create_table(
            "market_referrals",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("referrer_id", sa.String(128), nullable=False, index=True),
            sa.Column("referral_code", sa.String(64), nullable=False, unique=True, index=True),
            sa.Column("referral_channel", sa.String(50), nullable=False, default="LINK"),
            sa.Column("trip_id", sa.String(64), nullable=True),
            sa.Column("destination_id", sa.String(64), nullable=True),
            sa.Column("context_type", sa.String(50), nullable=False, default="TRIP"),
            sa.Column("recipient_anonymous_id", sa.String(128), nullable=True, index=True),
            sa.Column("status", sa.String(50), nullable=False, default="CREATED"),
            sa.Column("first_visit_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("activated_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("trip_created_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("converted_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 4. market_review_validations
    if "market_review_validations" not in existing_tables:
        op.create_table(
            "market_review_validations",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("review_id", sa.String(64), nullable=False, unique=True, index=True),
            sa.Column("experience_id", sa.String(64), nullable=True, index=True),
            sa.Column("provider_id", sa.String(36), nullable=False, index=True),
            sa.Column("consumer_id", sa.String(128), nullable=True),
            sa.Column("requested_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("verified_experience", sa.Boolean(), nullable=False, default=True),
            sa.Column("rating", sa.Float(), nullable=False, default=5.0),
            sa.Column("review_length", sa.Integer(), nullable=False, default=0),
            sa.Column("media_attached", sa.Boolean(), nullable=False, default=False),
            sa.Column("experience_specificity", sa.String(50), nullable=True, default="SPECIFIC"),
            sa.Column("helpful_votes", sa.Integer(), nullable=False, default=0),
            sa.Column("downstream_views", sa.Integer(), nullable=False, default=0),
            sa.Column("downstream_saves", sa.Integer(), nullable=False, default=0),
            sa.Column("downstream_bookings", sa.Integer(), nullable=False, default=0),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 5. market_provider_retention
    if "market_provider_retention" not in existing_tables:
        op.create_table(
            "market_provider_retention",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("provider_id", sa.String(36), nullable=False, unique=True, index=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
            sa.Column("onboarded_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("last_active_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("last_lead_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_lead_responded_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("last_listing_update_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("total_leads_received", sa.Integer(), nullable=False, default=0),
            sa.Column("total_leads_responded", sa.Integer(), nullable=False, default=0),
            sa.Column("total_bookings_managed", sa.Integer(), nullable=False, default=0),
            sa.Column("listing_update_count", sa.Integer(), nullable=False, default=0),
            sa.Column("reactivated_count", sa.Integer(), nullable=False, default=0),
            sa.Column("continuation_status", sa.String(50), nullable=False, default="CONTINUOUS"),
            sa.Column("supply_density_region", sa.String(50), nullable=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 6. market_creator_retention
    if "market_creator_retention" not in existing_tables:
        op.create_table(
            "market_creator_retention",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("creator_id", sa.String(128), nullable=False, unique=True, index=True),
            sa.Column("profile_created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("last_submission_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("content_submitted_count", sa.Integer(), nullable=False, default=0),
            sa.Column("content_published_count", sa.Integer(), nullable=False, default=0),
            sa.Column("total_content_views", sa.Integer(), nullable=False, default=0),
            sa.Column("total_content_saves", sa.Integer(), nullable=False, default=0),
            sa.Column("downstream_trips_influenced", sa.Integer(), nullable=False, default=0),
            sa.Column("creator_reactivated_count", sa.Integer(), nullable=False, default=0),
            sa.Column("retention_state", sa.String(50), nullable=False, default="ACTIVE"),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 7. market_network_interactions
    if "market_network_interactions" not in existing_tables:
        op.create_table(
            "market_network_interactions",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("actor_type", sa.String(50), nullable=False, index=True),
            sa.Column("actor_id", sa.String(128), nullable=False, index=True),
            sa.Column("target_type", sa.String(50), nullable=False, index=True),
            sa.Column("target_id", sa.String(128), nullable=False, index=True),
            sa.Column("interaction_type", sa.String(50), nullable=False, index=True),
            sa.Column("session_id", sa.String(128), nullable=True),
            sa.Column("source", sa.String(50), nullable=True),
            sa.Column("geography", sa.String(50), nullable=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 8. market_network_gaps
    if "market_network_gaps" not in existing_tables:
        op.create_table(
            "market_network_gaps",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("geography", sa.String(50), nullable=False, index=True),
            sa.Column("destination", sa.String(100), nullable=False, index=True),
            sa.Column("provider_supply_count", sa.Integer(), nullable=False, default=0),
            sa.Column("content_supply_count", sa.Integer(), nullable=False, default=0),
            sa.Column("traveler_demand_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("interaction_density", sa.Float(), nullable=False, default=0.0),
            sa.Column("booking_activity", sa.Integer(), nullable=False, default=0),
            sa.Column("retention_rate", sa.Float(), nullable=False, default=0.0),
            sa.Column("opportunity_score", sa.Float(), nullable=False, default=0.0),
            sa.Column("recommended_action", sa.String(100), nullable=True),
            sa.Column("metadata_json", json_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    op.drop_table("market_network_gaps")
    op.drop_table("market_network_interactions")
    op.drop_table("market_creator_retention")
    op.drop_table("market_provider_retention")
    op.drop_table("market_review_validations")
    op.drop_table("market_referrals")
    op.drop_table("market_retention_cohorts")
    op.drop_table("market_consumer_retention")
