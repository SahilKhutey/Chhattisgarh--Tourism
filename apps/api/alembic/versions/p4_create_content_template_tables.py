from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "p4_create_content_template_tables"
down_revision = "p3_enable_postgis_and_places"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "content_templates",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(160),
            nullable=False,
        ),
        sa.Column(
            "slug",
            sa.String(180),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "icon",
            sa.String(120),
            nullable=True,
        ),
        sa.Column(
            "category",
            sa.String(100),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(30),
            nullable=False,
            server_default="DRAFT",
        ),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column(
            "updated_by",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "slug",
            name="uq_content_template_slug",
        ),
    )

    op.create_index(
        "ix_content_templates_slug",
        "content_templates",
        ["slug"],
    )

    op.create_index(
        "ix_content_templates_status",
        "content_templates",
        ["status"],
    )

    op.create_table(
        "template_fields",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "template_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey(
                "content_templates.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),
        sa.Column(
            "key",
            sa.String(64),
            nullable=False,
        ),
        sa.Column(
            "label",
            sa.String(160),
            nullable=False,
        ),
        sa.Column(
            "field_type",
            sa.String(40),
            nullable=False,
        ),
        sa.Column(
            "required",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "translatable",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "order",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "group_name",
            sa.String(100),
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
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "template_id",
            "key",
            name="uq_template_field_key",
        ),
    )

    op.create_index(
        "ix_template_fields_template_id",
        "template_fields",
        ["template_id"],
    )


def downgrade():
    op.drop_index(
        "ix_template_fields_template_id",
        table_name="template_fields",
    )
    op.drop_table("template_fields")
    op.drop_index(
        "ix_content_templates_status",
        table_name="content_templates",
    )
    op.drop_index(
        "ix_content_templates_slug",
        table_name="content_templates",
    )
    op.drop_table("content_templates")
