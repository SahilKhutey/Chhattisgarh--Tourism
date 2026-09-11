"""p10 public content indexes

Revision ID: p10_public_content_indexes
Revises: p9_localization_glossary_accessibility
Create Date: 2026-09-11 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "p10_public_content_indexes"
down_revision = "p9_localization_glossary_accessibility"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Performance indexes for public content queries
    op.create_index(
        "idx_content_entries_public_slug",
        "content_entries",
        ["slug"],
        unique=False,
    )
    op.create_index(
        "idx_content_entries_status_slug",
        "content_entries",
        ["status", "slug"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_content_entries_status_slug", table_name="content_entries")
    op.drop_index("idx_content_entries_public_slug", table_name="content_entries")
