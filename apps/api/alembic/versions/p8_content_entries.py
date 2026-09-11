"""add content entry runtime

Revision ID: p8_content_entries
Revises: p7_template_versions
Create Date: 2026-09-11 15:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p8_content_entries"
down_revision = "p7_template_versions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "content_entries",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "template_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "template_version_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "slug",
            sa.String(length=220),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="DRAFT",
        ),
        sa.Column(
            "title",
            sa.String(length=300),
            nullable=False,
        ),
        sa.Column(
            "values",
            sa.JSON(),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "locale_values",
            sa.JSON(),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "revision",
            sa.Integer(),
            nullable=False,
            server_default="1",
        ),
        sa.Column(
            "created_by",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "updated_by",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "published_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["template_id"],
            ["content_templates.id"],
            name="fk_content_entries_template_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["template_version_id"],
            ["template_versions.id"],
            name="fk_content_entries_template_version_id",
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint(
            "template_id",
            "slug",
            name="uq_content_entry_template_slug",
        ),
    )

    op.create_index(
        "ix_content_entries_template_id",
        "content_entries",
        ["template_id"],
    )

    op.create_index(
        "ix_content_entries_template_version_id",
        "content_entries",
        ["template_version_id"],
    )

    op.create_index(
        "ix_content_entries_status",
        "content_entries",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_content_entries_status",
        table_name="content_entries",
    )
    op.drop_index(
        "ix_content_entries_template_version_id",
        table_name="content_entries",
    )
    op.drop_index(
        "ix_content_entries_template_id",
        table_name="content_entries",
    )
    op.drop_table("content_entries")
