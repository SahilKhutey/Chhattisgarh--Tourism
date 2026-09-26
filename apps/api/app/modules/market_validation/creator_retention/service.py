from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.modules.market_validation.creator_retention.models import MarketCreatorRetention
from app.modules.market_validation.creator_retention.repository import CreatorRetentionRepository
from app.modules.market_validation.creator_retention.schemas import (
    CreatorActivityRecord,
    CreatorRetentionResponse,
    CreatorLoopMetrics,
)


class CreatorRetentionService:
    def __init__(self, repo: CreatorRetentionRepository | None = None):
        self.repo = repo or CreatorRetentionRepository()

    def record_activity(self, db: Session, payload: CreatorActivityRecord) -> CreatorRetentionResponse:
        now = payload.timestamp or datetime.now(timezone.utc)
        record = self.repo.get_by_creator_id(db, payload.creator_id)

        if not record:
            record = MarketCreatorRetention(
                creator_id=payload.creator_id,
                profile_created_at=now,
                last_submission_at=now,
                content_submitted_count=payload.count if payload.activity_type == "CONTENT_SUBMITTED" else 0,
                content_published_count=payload.count if payload.activity_type == "CONTENT_PUBLISHED" else 0,
                retention_state="ACTIVE",
                metadata_json=payload.metadata or {},
            )
            record = self.repo.create(db, record)
            return CreatorRetentionResponse.model_validate(record)

        act = payload.activity_type.upper()
        if act == "CONTENT_SUBMITTED":
            record.content_submitted_count += payload.count
            record.last_submission_at = now
            if record.retention_state == "INACTIVE":
                record.creator_reactivated_count += 1
                record.retention_state = "REACTIVATED"
        elif act == "CONTENT_PUBLISHED":
            record.content_published_count += payload.count
        elif act == "VIEW_ACCRUED":
            record.total_content_views += payload.count
        elif act == "SAVE_ACCRUED":
            record.total_content_saves += payload.count
        elif act == "TRIP_INFLUENCED":
            record.downstream_trips_influenced += payload.count

        if record.content_published_count >= 10:
            record.retention_state = "PROLIFIC"

        saved = self.repo.update(db, record)
        return CreatorRetentionResponse.model_validate(saved)

    def get_loop_metrics(self, db: Session) -> CreatorLoopMetrics:
        total, items = self.repo.list(db, limit=10000)
        active = sum(1 for c in items if c.retention_state in {"ACTIVE", "PROLIFIC", "REACTIVATED"})
        pieces = sum(c.content_published_count for c in items)
        views = sum(c.total_content_views for c in items)
        trips = sum(c.downstream_trips_influenced for c in items)

        cont_rate = round(active / max(1, total), 4) if total > 0 else 0.0
        avg_trips = round(trips / max(1, active), 2) if active > 0 else 0.0

        return CreatorLoopMetrics(
            total_active_creators=active,
            total_content_pieces=pieces,
            total_views_generated=views,
            total_trips_influenced=trips,
            creator_continuation_rate=cont_rate,
            average_trips_per_creator=avg_trips,
        )
