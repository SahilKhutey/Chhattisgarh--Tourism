"""p9 localization glossary accessibility

Revision ID: p9_localization_glossary_accessibility
Revises: p8_content_entries
Create Date: 2026-09-11 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p9_localization_glossary_accessibility"
down_revision = "p8_content_entries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. locales
    op.create_table(
        "locales",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("code", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("native_name", sa.String(length=100), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_locales_code", "locales", ["code"], unique=True)

    # 2. glossary_terms
    op.create_table(
        "glossary_terms",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("key", sa.String(length=150), nullable=False),
        sa.Column("definition", sa.Text(), nullable=True),
        sa.Column("context", sa.Text(), nullable=True),
        sa.Column("preferred", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("deprecated", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_glossary_terms_key", "glossary_terms", ["key"], unique=True)

    # 3. glossary_term_locales
    op.create_table(
        "glossary_term_locales",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "term_id",
            sa.Integer(),
            sa.ForeignKey("glossary_terms.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("locale_code", sa.String(length=16), nullable=False),
        sa.Column("term", sa.String(length=255), nullable=False),
        sa.Column("synonyms", sa.Text(), nullable=True),
        sa.UniqueConstraint("term_id", "locale_code", name="uq_glossary_term_locale"),
    )
    op.create_index("ix_glossary_term_locales_term_id", "glossary_term_locales", ["term_id"])
    op.create_index("ix_glossary_term_locales_locale_code", "glossary_term_locales", ["locale_code"])

    # 4. template_localizations
    op.create_table(
        "template_localizations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "template_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("content_templates.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("locale_code", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default=sa.text("'DRAFT'")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("template_id", "locale_code", name="uq_template_localization_locale"),
    )
    op.create_index("ix_template_localizations_template_id", "template_localizations", ["template_id"])
    op.create_index("ix_template_localizations_locale_code", "template_localizations", ["locale_code"])

    # 5. content_localizations
    op.create_table(
        "content_localizations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "content_entry_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("content_entries.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("locale_code", sa.String(length=16), nullable=False),
        sa.Column("field_key", sa.String(length=150), nullable=False),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default=sa.text("'DRAFT'")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("content_entry_id", "locale_code", "field_key", name="uq_content_localization_field"),
    )
    op.create_index("ix_content_localizations_entry_id", "content_localizations", ["content_entry_id"])
    op.create_index("ix_content_localizations_locale_code", "content_localizations", ["locale_code"])

    # 6. accessibility_audits
    op.create_table(
        "accessibility_audits",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "content_entry_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("content_entries.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("locale_code", sa.String(length=16), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_accessibility_audits_content_entry_id", "accessibility_audits", ["content_entry_id"])

    # 7. accessibility_issues
    op.create_table(
        "accessibility_issues",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "audit_id",
            sa.Integer(),
            sa.ForeignKey("accessibility_audits.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("field_key", sa.String(length=150), nullable=True),
        sa.Column("code", sa.String(length=100), nullable=False),
        sa.Column("severity", sa.String(length=32), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("remediation", sa.Text(), nullable=True),
    )
    op.create_index("ix_accessibility_issues_audit_id", "accessibility_issues", ["audit_id"])


def downgrade() -> None:
    op.drop_table("accessibility_issues")
    op.drop_table("accessibility_audits")
    op.drop_table("content_localizations")
    op.drop_table("template_localizations")
    op.drop_table("glossary_term_locales")
    op.drop_table("glossary_terms")
    op.drop_table("locales")
