"""p22_market_validation_mv13

Revision ID: p22_market_validation_mv13
Revises: p21_market_validation_mv11
Create Date: 2026-09-26 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p22_market_validation_mv13"
down_revision = "p21_market_validation_mv11"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. market_validation_evidence_snapshots
    if "market_validation_evidence_snapshots" not in existing_tables:
        op.create_table(
            "market_validation_evidence_snapshots",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("version", sa.Integer(), nullable=False, default=1),
            sa.Column("mv1_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv2_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv3_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv4_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv5_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv6_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv7_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv8_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv9_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv10_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv11_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("mv12_status", sa.String(50), nullable=False, default="VALIDATED"),
            sa.Column("evidence_count", sa.Integer(), nullable=False, default=0),
            sa.Column("strong_evidence_count", sa.Integer(), nullable=False, default=0),
            sa.Column("contradictory_evidence_count", sa.Integer(), nullable=False, default=0),
            sa.Column("consumer_evidence", json_type, nullable=True),
            sa.Column("supply_evidence", json_type, nullable=True),
            sa.Column("geographic_evidence", json_type, nullable=True),
            sa.Column("content_evidence", json_type, nullable=True),
            sa.Column("transaction_evidence", json_type, nullable=True),
            sa.Column("retention_evidence", json_type, nullable=True),
            sa.Column("economic_evidence", json_type, nullable=True),
            sa.Column("operational_evidence", json_type, nullable=True),
            sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("generated_by", sa.String(128), nullable=False, default="SYSTEM"),
        )

    # 2. market_validation_decisions
    if "market_validation_decisions" not in existing_tables:
        op.create_table(
            "market_validation_decisions",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("version", sa.Integer(), nullable=False, default=1),
            sa.Column("decision", sa.String(50), nullable=False),  # GO, CONDITIONAL_GO, CONTINUE_VALIDATION, PIVOT, NO_GO
            sa.Column("rationale", sa.Text(), nullable=False),
            sa.Column("evidence_snapshot_id", sa.String(36), nullable=False, index=True),
            sa.Column("policy_version", sa.String(50), nullable=False, default="1.0.0"),
            sa.Column("gate_snapshot", json_type, nullable=True),
            sa.Column("risk_snapshot", json_type, nullable=True),
            sa.Column("contradiction_snapshot", json_type, nullable=True),
            sa.Column("unknowns_snapshot", json_type, nullable=True),
            sa.Column("recommendation_scope", json_type, nullable=True),
            sa.Column("confidence", sa.String(50), nullable=False, default="HIGH"),
            sa.Column("approved_by", sa.String(128), nullable=False, default="EXECUTIVE_COMMITTEE"),
            sa.Column("decided_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    # 3. market_validation_risks
    if "market_validation_risks" not in existing_tables:
        op.create_table(
            "market_validation_risks",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("domain", sa.String(50), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("probability", sa.Float(), nullable=False, default=0.0),
            sa.Column("impact", sa.Float(), nullable=False, default=0.0),
            sa.Column("severity", sa.String(50), nullable=False, default="MEDIUM"),
            sa.Column("mitigation", sa.Text(), nullable=False),
            sa.Column("owner", sa.String(100), nullable=False, default="PRODUCT_LEAD"),
            sa.Column("status", sa.String(50), nullable=False, default="OPEN"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    op.drop_table("market_validation_risks")
    op.drop_table("market_validation_decisions")
    op.drop_table("market_validation_evidence_snapshots")
