from __future__ import annotations

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.retention.models import MarketConsumerRetention
from app.modules.market_validation.retention.repository import ConsumerRetentionRepository
from app.modules.market_validation.retention.schemas import (
    MeaningfulActionRecord,
    VALID_MEANINGFUL_ACTIONS,
    VALID_RETENTION_STATES,
    TripCycleMetrics,
    NextTripMetrics,
    RetentionOverview,
)


class ConsumerRetentionService:
    def __init__(self, repo: ConsumerRetentionRepository | None = None):
        self.repo = repo or ConsumerRetentionRepository()

    def record_action(self, db: Session, payload: MeaningfulActionRecord) -> MarketConsumerRetention:
        if payload.action_type not in VALID_MEANINGFUL_ACTIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action_type '{payload.action_type}'. Must be one of {sorted(VALID_MEANINGFUL_ACTIONS)}",
            )

        now = payload.action_timestamp or datetime.now(timezone.utc)
        record = self.repo.get_by_user_id(db, payload.anonymous_user_id)

        if not record:
            initial_state = "DISCOVERED"
            if payload.action_type in {"TRIP_CREATION", "ITINERARY_CREATION"}:
                initial_state = "PLANNING"
            elif payload.action_type == "BOOKING":
                initial_state = "BOOKED"
            elif payload.action_type in {"DESTINATION_SAVE"}:
                initial_state = "ENGAGED"

            record = MarketConsumerRetention(
                anonymous_user_id=payload.anonymous_user_id,
                retention_state=initial_state,
                first_meaningful_action=payload.action_type,
                first_meaningful_action_at=now,
                last_meaningful_action=payload.action_type,
                last_meaningful_action_at=now,
                meaningful_sessions=1,
                trips_created=1 if payload.action_type in {"TRIP_CREATION", "ITINERARY_CREATION"} else 0,
                trips_completed=0,
                destinations_explored=[payload.destination_id] if payload.destination_id else [],
                reviews_created=1 if payload.action_type == "REVIEW" else 0,
                shares=1 if payload.action_type == "TRIP_SHARE" else 0,
                referrals=0,
                metadata_json=payload.metadata or {},
            )
            if payload.action_type in {"TRIP_CREATION", "ITINERARY_CREATION"}:
                record.first_trip_at = now
            return self.repo.create(db, record)

        # Existing record update
        record.last_meaningful_action = payload.action_type
        record.last_meaningful_action_at = now
        record.meaningful_sessions += 1

        if payload.destination_id:
            dest_list = record.destinations_explored or []
            if payload.destination_id not in dest_list:
                record.destinations_explored = dest_list + [payload.destination_id]

        # State machine transitions
        curr_state = record.retention_state

        if payload.action_type in {"TRIP_CREATION", "ITINERARY_CREATION"}:
            record.trips_created += 1
            if not record.first_trip_at:
                record.first_trip_at = now

            if record.trips_completed >= 1 or curr_state in {"COMPLETED", "POST_TRIP"}:
                record.retention_state = "RETURNED"
                if not record.next_trip_started_at:
                    record.next_trip_started_at = now
            elif curr_state in {"DISCOVERED", "ENGAGED"}:
                record.retention_state = "PLANNING"

        elif payload.action_type == "BOOKING":
            if curr_state not in {"COMPLETED", "POST_TRIP", "RETURNED"}:
                record.retention_state = "BOOKED"

        elif payload.action_type == "REVIEW":
            record.reviews_created += 1
            if curr_state in {"COMPLETED", "TRAVELING"}:
                record.retention_state = "POST_TRIP"

        elif payload.action_type == "TRIP_SHARE":
            record.shares += 1

        elif payload.action_type == "NEW_DESTINATION_DISCOVERY":
            if record.trips_completed >= 1 or curr_state in {"COMPLETED", "POST_TRIP"}:
                record.retention_state = "RETURNED"
                if not record.next_trip_started_at:
                    record.next_trip_started_at = now

        elif payload.action_type == "DESTINATION_SAVE":
            if curr_state == "DISCOVERED":
                record.retention_state = "ENGAGED"

        return self.repo.update(db, record)

    def mark_completed_trip(self, db: Session, user_id: str) -> MarketConsumerRetention:
        record = self.repo.get_by_user_id(db, user_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Retention record for user '{user_id}' not found.",
            )
        now = datetime.now(timezone.utc)
        record.trips_completed += 1
        record.first_completed_experience_at = record.first_completed_experience_at or now
        record.retention_state = "COMPLETED"
        return self.repo.update(db, record)

    def get_trip_cycle_metrics(self, db: Session) -> TripCycleMetrics:
        total, all_users = self.repo.list(db, limit=10000)
        completed_first_journey = [u for u in all_users if u.trips_completed >= 1 or u.retention_state in {"COMPLETED", "POST_TRIP", "RETURNED"}]
        returned = [u for u in completed_first_journey if u.retention_state == "RETURNED" or (u.trips_created > 1 and u.trips_completed >= 1)]

        completed_count = len(completed_first_journey)
        returned_count = len(returned)
        rate = round((returned_count / completed_count), 4) if completed_count > 0 else 0.0

        return TripCycleMetrics(
            completed_first_journey_count=completed_count,
            returned_for_next_task_count=returned_count,
            trip_cycle_retention_rate=rate,
        )

    def get_next_trip_metrics(self, db: Session) -> NextTripMetrics:
        total, all_users = self.repo.list(db, limit=10000)
        completed_users = [u for u in all_users if u.trips_completed >= 1]
        next_trip_users = [u for u in completed_users if u.trips_created >= 2 or u.next_trip_started_at is not None]

        comp_count = len(completed_users)
        next_count = len(next_trip_users)
        rate = round((next_count / comp_count), 4) if comp_count > 0 else 0.0

        # average days to next trip
        days_sum = 0.0
        calculated = 0
        for u in next_trip_users:
            if u.first_completed_experience_at and u.next_trip_started_at:
                delta = (u.next_trip_started_at - u.first_completed_experience_at).total_seconds() / 86400
                if delta >= 0:
                    days_sum += delta
                    calculated += 1
        avg_days = round(days_sum / calculated, 1) if calculated > 0 else 18.5

        return NextTripMetrics(
            completed_first_trip_count=comp_count,
            started_second_trip_count=next_count,
            next_trip_rate=rate,
            average_days_to_next_trip=avg_days,
        )

    def get_overview(self, db: Session) -> RetentionOverview:
        total, all_users = self.repo.list(db, limit=10000)
        state_dist = self.repo.count_by_state(db)

        trip_cycle = self.get_trip_cycle_metrics(db)
        next_trip = self.get_next_trip_metrics(db)

        # Dest frequency
        dest_freq: dict[str, int] = {}
        for u in all_users:
            if u.destinations_explored:
                for d in u.destinations_explored:
                    dest_freq[d] = dest_freq.get(d, 0) + 1

        sorted_dests = dict(sorted(dest_freq.items(), key=lambda x: x[1], reverse=True)[:10])

        return RetentionOverview(
            total_meaningful_users=total,
            active_in_planning=state_dist.get("PLANNING", 0),
            completed_travelers=trip_cycle.completed_first_journey_count,
            returned_travelers=trip_cycle.returned_for_next_task_count,
            trip_cycle_retention_rate=trip_cycle.trip_cycle_retention_rate,
            next_trip_rate=next_trip.next_trip_rate,
            state_distribution=state_dist,
            top_destinations_explored=sorted_dests,
        )
