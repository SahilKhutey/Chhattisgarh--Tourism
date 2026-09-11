from alembic import op
import sqlalchemy as sa
import geoalchemy2

revision = "p3_enable_postgis_and_places"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Explicitly manage PostGIS extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis_topology")

    op.create_table(
        "places",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "geometry",
            geoalchemy2.types.Geometry(
                geometry_type="POINT",
                srid=4326,
                spatial_index=False,
                from_text="ST_GeomFromEWKT",
                name="geometry",
                nullable=True,
            ),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_places_slug", "places", ["slug"], unique=True)
    op.create_index(
        "idx_places_geometry",
        "places",
        ["geometry"],
        unique=False,
        postgresql_using="gist",
    )


def downgrade() -> None:
    op.drop_index("idx_places_geometry", table_name="places", postgresql_using="gist")
    op.drop_index("ix_places_slug", table_name="places")
    op.drop_table("places")
