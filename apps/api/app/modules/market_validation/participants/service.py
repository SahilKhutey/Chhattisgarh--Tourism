from __future__ import annotations

import uuid
import secrets
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.participants.models import MarketParticipant
from app.modules.market_validation.participants.schemas import (
    ParticipantCreate,
    ParticipantUpdate,
)
from app.modules.market_validation.participants.repository import ParticipantRepository


class ParticipantService:
    def __init__(self, repo: ParticipantRepository | None = None):
        self.repo = repo or ParticipantRepository()

    def generate_anonymous_id(self) -> str:
        suffix = secrets.token_hex(4).upper()
        return f"PART-{suffix}"

    def create_participant(self, db: Session, payload: ParticipantCreate) -> MarketParticipant:
        anon_id = self.generate_anonymous_id()
        while self.repo.get_by_anonymous_id(db, anon_id) is not None:
            anon_id = self.generate_anonymous_id()

        participant = MarketParticipant(
            id=uuid.uuid4(),
            anonymous_id=anon_id,
            segment=payload.segment,
            traveler_type=payload.traveler_type,
            origin_region=payload.origin_region,
            age_band=payload.age_band,
            travel_frequency=payload.travel_frequency,
            cg_visit_history=payload.cg_visit_history,
            digital_behavior=payload.digital_behavior,
            planning_method=payload.planning_method,
            preferred_language=payload.preferred_language,
            accessibility_needs=payload.accessibility_needs,
            consent_status=payload.consent_status,
            recruitment_source=payload.recruitment_source,
        )
        return self.repo.create(db, participant)

    def get_participant(self, db: Session, participant_id: uuid.UUID) -> MarketParticipant:
        participant = self.repo.get_by_id(db, participant_id)
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant {participant_id} not found.",
            )
        return participant

    def list_participants(
        self,
        db: Session,
        segment: str | None = None,
        origin_region: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketParticipant]]:
        return self.repo.list(db, segment=segment, origin_region=origin_region, limit=limit, offset=offset)

    def update_participant(
        self,
        db: Session,
        participant_id: uuid.UUID,
        payload: ParticipantUpdate,
    ) -> MarketParticipant:
        participant = self.get_participant(db, participant_id)
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(participant, field, value)
        return self.repo.update(db, participant)
