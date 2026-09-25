"""p14_market_validation_mv2

Revision ID: p14_market_validation_mv2
Revises: p13_final_integration
Create Date: 2026-09-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p14_market_validation_mv2"
down_revision = "p13_final_integration"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_participants
    op.create_table(
        "market_participants",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("anonymous_id", sa.String(64), unique=True, nullable=False),
        sa.Column("segment", sa.String(64), nullable=False),
        sa.Column("traveler_type", json_type, nullable=False),
        sa.Column("origin_region", sa.String(120), nullable=False),
        sa.Column("age_band", sa.String(32), nullable=False),
        sa.Column("travel_frequency", sa.String(64), nullable=False),
        sa.Column("cg_visit_history", sa.String(64), nullable=False),
        sa.Column("digital_behavior", json_type, nullable=True),
        sa.Column("planning_method", sa.String(64), nullable=False),
        sa.Column("preferred_language", sa.String(16), nullable=False, server_default="en"),
        sa.Column("accessibility_needs", sa.Text(), nullable=True),
        sa.Column("consent_status", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("recruitment_source", sa.String(120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_participants_anonymous_id", "market_participants", ["anonymous_id"])
    op.create_index("ix_market_participants_segment", "market_participants", ["segment"])

    # 2. market_interviews
    op.create_table(
        "market_interviews",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("participant_id", uuid_type, sa.ForeignKey("market_participants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("research_project", sa.String(120), nullable=False, server_default="CG_TOURISM_MV2"),
        sa.Column("interviewer", sa.String(120), nullable=False),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("travel_context", sa.Text(), nullable=True),
        sa.Column("destination", sa.String(120), nullable=True),
        sa.Column("transcript_status", sa.String(32), nullable=False, server_default="PLANNED"),
        sa.Column("recording_consent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("key_findings", json_type, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_interviews_participant_id", "market_interviews", ["participant_id"])
    op.create_index("ix_market_interviews_status", "market_interviews", ["transcript_status"])

    # 3. consumer_problems
    op.create_table(
        "consumer_problems",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("participant_id", uuid_type, sa.ForeignKey("market_participants.id", ondelete="SET NULL"), nullable=True),
        sa.Column("interview_id", uuid_type, sa.ForeignKey("market_interviews.id", ondelete="SET NULL"), nullable=True),
        sa.Column("journey_stage", sa.String(64), nullable=False),
        sa.Column("problem_statement", sa.Text(), nullable=False),
        sa.Column("current_behavior", sa.Text(), nullable=False),
        sa.Column("workaround", sa.Text(), nullable=False),
        sa.Column("frequency", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("severity", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("emotional_cost", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("financial_cost", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("time_cost", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("trust_impact", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("pain_score", sa.Integer(), nullable=False, server_default="81"),
        sa.Column("evidence_strength", sa.String(64), nullable=False),
        sa.Column("affected_segment", sa.String(64), nullable=True),
        sa.Column("affected_geography", sa.String(120), nullable=True),
        sa.Column("related_jtbd", sa.String(64), nullable=True),
        sa.Column("cluster_tag", sa.String(120), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="UNTESTED"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_consumer_problems_journey_stage", "consumer_problems", ["journey_stage"])
    op.create_index("ix_consumer_problems_pain_score", "consumer_problems", ["pain_score"])
    op.create_index("ix_consumer_problems_cluster_tag", "consumer_problems", ["cluster_tag"])
    op.create_index("ix_consumer_problems_related_jtbd", "consumer_problems", ["related_jtbd"])

    # 4. validation_evidence
    op.create_table(
        "validation_evidence",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("participant_id", uuid_type, sa.ForeignKey("market_participants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interview_id", uuid_type, sa.ForeignKey("market_interviews.id", ondelete="CASCADE"), nullable=False),
        sa.Column("problem_id", uuid_type, sa.ForeignKey("consumer_problems.id", ondelete="SET NULL"), nullable=True),
        sa.Column("jtbd_id", sa.String(64), nullable=True),
        sa.Column("evidence_type", sa.String(64), nullable=False),
        sa.Column("observation", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("researcher_confidence", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_validation_evidence_problem_id", "validation_evidence", ["problem_id"])
    op.create_index("ix_validation_evidence_jtbd_id", "validation_evidence", ["jtbd_id"])
    op.create_index("ix_validation_evidence_type", "validation_evidence", ["evidence_type"])

    # 5. jtbd_validations
    op.create_table(
        "jtbd_validations",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("jtbd_key", sa.String(32), unique=True, nullable=False),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="UNTESTED"),
        sa.Column("total_interviews_evaluated", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("supporting_interviews_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("direct_behavior_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("observed_workaround_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("evidence_summary", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_jtbd_validations_key", "jtbd_validations", ["jtbd_key"])

    # 6. consumer_planning_baselines
    op.create_table(
        "consumer_planning_baselines",
        sa.Column("id", uuid_type, primary_key=True, nullable=False),
        sa.Column("participant_id", uuid_type, sa.ForeignKey("market_participants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("task_id", sa.String(120), nullable=False),
        sa.Column("completion_status", sa.String(32), nullable=False, server_default="COMPLETED"),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("tools_used", json_type, nullable=False),
        sa.Column("searches_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("manual_steps", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("unresolved_questions", json_type, nullable=True),
        sa.Column("confidence_score", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("researcher_notes", sa.Text(), nullable=True),
        sa.Column("workflow_fragmentation_score", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_consumer_planning_baselines_participant", "consumer_planning_baselines", ["participant_id"])


def downgrade() -> None:
    op.drop_table("consumer_planning_baselines")
    op.drop_table("validation_evidence")
    op.drop_table("consumer_problems")
    op.drop_table("market_interviews")
    op.drop_table("market_participants")
    op.drop_table("jtbd_validations")
