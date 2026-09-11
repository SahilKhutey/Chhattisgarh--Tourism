from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p7_template_versions"
down_revision = "p4_create_content_template_tables"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "template_versions",
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
            "version_number",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=200),
            nullable=False,
        ),
        sa.Column(
            "slug",
            sa.String(length=200),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "icon",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "schema_hash",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column(
            "breaking_change",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "risk_summary",
            sa.JSON(),
            nullable=False,
        ),
        sa.Column(
            "created_by",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["template_id"],
            ["content_templates.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "template_id",
            "version_number",
            name="uq_template_version_number",
        ),
    )

    op.create_index(
        "ix_template_versions_template_id",
        "template_versions",
        ["template_id"],
    )

    op.create_index(
        "ix_template_versions_schema_hash",
        "template_versions",
        ["schema_hash"],
    )

    op.create_table(
        "template_version_fields",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "version_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "key",
            sa.String(length=80),
            nullable=False,
        ),
        sa.Column(
            "label",
            sa.String(length=200),
            nullable=False,
        ),
        sa.Column(
            "type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "required",
            sa.Boolean(),
            nullable=False,
        ),
        sa.Column(
            "translatable",
            sa.Boolean(),
            nullable=False,
        ),
        sa.Column(
            "order",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "group",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "help_text",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "config",
            sa.JSON(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["version_id"],
            ["template_versions.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "version_id",
            "key",
            name="uq_template_version_field_key",
        ),
        sa.UniqueConstraint(
            "version_id",
            "order",
            name="uq_template_version_field_order",
        ),
    )

    op.create_index(
        "ix_template_version_fields_version_id",
        "template_version_fields",
        ["version_id"],
    )

    op.add_column(
        "content_templates",
        sa.Column(
            "published_version_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_content_templates_published_version_id",
        "content_templates",
        ["published_version_id"],
    )

    op.create_foreign_key(
        "fk_content_templates_published_version",
        "content_templates",
        "template_versions",
        ["published_version_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint(
        "fk_content_templates_published_version",
        "content_templates",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_content_templates_published_version_id",
        table_name="content_templates",
    )

    op.drop_column(
        "content_templates",
        "published_version_id",
    )

    op.drop_index(
        "ix_template_version_fields_version_id",
        table_name="template_version_fields",
    )

    op.drop_table(
        "template_version_fields",
    )

    op.drop_index(
        "ix_template_versions_schema_hash",
        table_name="template_versions",
    )

    op.drop_index(
        "ix_template_versions_template_id",
        table_name="template_versions",
    )

    op.drop_table(
        "template_versions",
    )
