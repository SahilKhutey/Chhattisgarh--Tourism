"""p23_social_feed_subsystem

Revision ID: p23_social_feed_subsystem
Revises: p22_market_validation_mv13
Create Date: 2026-10-02 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "p23_social_feed_subsystem"
down_revision = "p22_market_validation_mv13"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    uuid_type = postgresql.UUID(as_uuid=True) if is_postgres else sa.String(36)
    json_type = postgresql.JSONB(astext_type=sa.Text()) if is_postgres else sa.JSON()

    # 1. creators
    if "creators" not in existing_tables:
        op.create_table(
            "creators",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("user_id", uuid_type, nullable=False, unique=True),
            sa.Column("handle", sa.String(50), nullable=False, unique=True),
            sa.Column("display_name", sa.String(120), nullable=False),
            sa.Column("bio", sa.Text(), nullable=True),
            sa.Column("avatar_url", sa.String(500), nullable=True),
            sa.Column("district_id", sa.String(80), nullable=False, default="bastar"),
            sa.Column("languages", json_type, nullable=False),
            sa.Column("categories", json_type, nullable=False),
            sa.Column("status", sa.String(30), nullable=False, default="PENDING"),
            sa.Column("is_verified", sa.Boolean(), nullable=False, default=False),
            sa.Column("followers_count", sa.Integer(), nullable=False, default=0),
            sa.Column("following_count", sa.Integer(), nullable=False, default=0),
            sa.Column("posts_count", sa.Integer(), nullable=False, default=0),
            sa.Column("featured_work_id", uuid_type, nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_creators_user_id", "creators", ["user_id"])
        op.create_index("ix_creators_handle", "creators", ["handle"], unique=True)
        op.create_index("ix_creators_district", "creators", ["district_id"])
        op.create_index("ix_creators_status", "creators", ["status"])

    # 2. social_contents
    if "social_contents" not in existing_tables:
        op.create_table(
            "social_contents",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("creator_id", uuid_type, sa.ForeignKey("creators.id", ondelete="CASCADE"), nullable=False),
            sa.Column("content_type", sa.String(30), nullable=False, default="POST"),
            sa.Column("title", sa.String(250), nullable=False),
            sa.Column("caption", sa.Text(), nullable=False, default=""),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("slug", sa.String(280), nullable=False, unique=True),
            sa.Column("district_id", sa.String(80), nullable=False, default="bastar"),
            sa.Column("tourism_zone_id", sa.String(80), nullable=True),
            sa.Column("place_id", uuid_type, nullable=True),
            sa.Column("place_slug", sa.String(150), nullable=True),
            sa.Column("route_id", sa.String(100), nullable=True),
            sa.Column("experience_id", sa.String(100), nullable=True),
            sa.Column("festival_name", sa.String(150), nullable=True),
            sa.Column("latitude", sa.Float(), nullable=True),
            sa.Column("longitude", sa.Float(), nullable=True),
            sa.Column("template_id", uuid_type, nullable=True),
            sa.Column("template_version_id", uuid_type, nullable=True),
            sa.Column("template_payload", json_type, nullable=False),
            sa.Column("cultural_tags", json_type, nullable=False),
            sa.Column("tourism_tags", json_type, nullable=False),
            sa.Column("hashtags", json_type, nullable=False),
            sa.Column("language", sa.String(10), nullable=False, default="hi"),
            sa.Column("cultural_sensitivity", sa.String(30), nullable=False, default="STANDARD"),
            sa.Column("license_type", sa.String(30), nullable=False, default="ORIGINAL_CREATOR"),
            sa.Column("source_attribution", sa.String(255), nullable=True),
            sa.Column("community_attribution", sa.String(255), nullable=True),
            sa.Column("has_sacred_consent", sa.Boolean(), nullable=False, default=False),
            sa.Column("visibility", sa.String(20), nullable=False, default="PUBLIC"),
            sa.Column("moderation_status", sa.String(30), nullable=False, default="PENDING"),
            sa.Column("publication_status", sa.String(30), nullable=False, default="DRAFT"),
            sa.Column("is_evergreen", sa.Boolean(), nullable=False, default=False),
            sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("likes_count", sa.Integer(), nullable=False, default=0),
            sa.Column("comments_count", sa.Integer(), nullable=False, default=0),
            sa.Column("saves_count", sa.Integer(), nullable=False, default=0),
            sa.Column("shares_count", sa.Integer(), nullable=False, default=0),
            sa.Column("trip_adds_count", sa.Integer(), nullable=False, default=0),
            sa.Column("views_count", sa.Integer(), nullable=False, default=0),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_social_contents_creator_id", "social_contents", ["creator_id"])
        op.create_index("ix_social_contents_content_type", "social_contents", ["content_type"])
        op.create_index("ix_social_contents_pub_status", "social_contents", ["publication_status"])
        op.create_index("ix_social_contents_mod_status", "social_contents", ["moderation_status"])
        op.create_index("ix_social_contents_district_id", "social_contents", ["district_id"])
        op.create_index("ix_social_contents_place_id", "social_contents", ["place_id"])
        op.create_index("ix_social_contents_place_slug", "social_contents", ["place_slug"])
        op.create_index("ix_social_contents_expires_at", "social_contents", ["expires_at"])
        op.create_index("ix_social_contents_created_at", "social_contents", ["created_at"])

    # 3. social_media
    if "social_media" not in existing_tables:
        op.create_table(
            "social_media",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("media_type", sa.String(20), nullable=False, default="IMAGE"),
            sa.Column("media_url", sa.String(1000), nullable=False),
            sa.Column("thumbnail_url", sa.String(1000), nullable=True),
            sa.Column("poster_url", sa.String(1000), nullable=True),
            sa.Column("duration_seconds", sa.Float(), nullable=True),
            sa.Column("aspect_ratio", sa.String(20), nullable=False, default="9:16"),
            sa.Column("resolution", sa.String(20), nullable=True),
            sa.Column("captions_url", sa.String(1000), nullable=True),
            sa.Column("transcript", sa.Text(), nullable=True),
            sa.Column("language", sa.String(10), nullable=False, default="hi"),
            sa.Column("processing_status", sa.String(30), nullable=False, default="READY"),
            sa.Column("sort_order", sa.Integer(), nullable=False, default=0),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_social_media_content_id", "social_media", ["content_id"])
        op.create_index("ix_social_media_media_type", "social_media", ["media_type"])

    # 4. social_likes
    if "social_likes" not in existing_tables:
        op.create_table(
            "social_likes",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", uuid_type, nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.UniqueConstraint("content_id", "user_id", name="uq_social_like_content_user"),
        )
        op.create_index("ix_social_likes_content_id", "social_likes", ["content_id"])
        op.create_index("ix_social_likes_user_id", "social_likes", ["user_id"])

    # 5. social_saves
    if "social_saves" not in existing_tables:
        op.create_table(
            "social_saves",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", uuid_type, nullable=False),
            sa.Column("collection_name", sa.String(80), nullable=False, default="Default"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.UniqueConstraint("content_id", "user_id", name="uq_social_save_content_user"),
        )
        op.create_index("ix_social_saves_content_id", "social_saves", ["content_id"])
        op.create_index("ix_social_saves_user_id", "social_saves", ["user_id"])

    # 6. social_comments
    if "social_comments" not in existing_tables:
        op.create_table(
            "social_comments",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", uuid_type, nullable=False),
            sa.Column("parent_id", uuid_type, sa.ForeignKey("social_comments.id", ondelete="CASCADE"), nullable=True),
            sa.Column("comment_text", sa.Text(), nullable=False),
            sa.Column("status", sa.String(20), nullable=False, default="VISIBLE"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_social_comments_content_id", "social_comments", ["content_id"])
        op.create_index("ix_social_comments_user_id", "social_comments", ["user_id"])

    # 7. social_shares
    if "social_shares" not in existing_tables:
        op.create_table(
            "social_shares",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", uuid_type, nullable=True),
            sa.Column("channel", sa.String(50), nullable=False, default="whatsapp"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_social_shares_content_id", "social_shares", ["content_id"])
        op.create_index("ix_social_shares_user_id", "social_shares", ["user_id"])

    # 8. social_trip_adds
    if "social_trip_adds" not in existing_tables:
        op.create_table(
            "social_trip_adds",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", uuid_type, nullable=False),
            sa.Column("trip_id", sa.String(100), nullable=True),
            sa.Column("place_slug", sa.String(150), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_social_trip_adds_content_id", "social_trip_adds", ["content_id"])
        op.create_index("ix_social_trip_adds_user_id", "social_trip_adds", ["user_id"])
        op.create_index("ix_social_trip_adds_place_slug", "social_trip_adds", ["place_slug"])

    # 9. creator_follows
    if "creator_follows" not in existing_tables:
        op.create_table(
            "creator_follows",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("creator_id", uuid_type, sa.ForeignKey("creators.id", ondelete="CASCADE"), nullable=False),
            sa.Column("follower_user_id", uuid_type, nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.UniqueConstraint("creator_id", "follower_user_id", name="uq_creator_follower"),
        )
        op.create_index("ix_creator_follows_creator_id", "creator_follows", ["creator_id"])
        op.create_index("ix_creator_follows_follower_id", "creator_follows", ["follower_user_id"])

    # 10. social_moderation_logs
    if "social_moderation_logs" not in existing_tables:
        op.create_table(
            "social_moderation_logs",
            sa.Column("id", uuid_type, primary_key=True),
            sa.Column("content_id", uuid_type, sa.ForeignKey("social_contents.id", ondelete="CASCADE"), nullable=False),
            sa.Column("moderator_id", uuid_type, nullable=False),
            sa.Column("decision", sa.String(40), nullable=False),
            sa.Column("reason", sa.Text(), nullable=False, default=""),
            sa.Column("cultural_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_social_moderation_content_id", "social_moderation_logs", ["content_id"])
        op.create_index("ix_social_moderation_moderator_id", "social_moderation_logs", ["moderator_id"])
        op.create_index("ix_social_moderation_decision", "social_moderation_logs", ["decision"])


def downgrade() -> None:
    op.drop_table("social_moderation_logs")
    op.drop_table("creator_follows")
    op.drop_table("social_trip_adds")
    op.drop_table("social_shares")
    op.drop_table("social_comments")
    op.drop_table("social_saves")
    op.drop_table("social_likes")
    op.drop_table("social_media")
    op.drop_table("social_contents")
    op.drop_table("creators")
