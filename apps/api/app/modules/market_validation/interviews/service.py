from __future__ import annotations

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.participants.models import MarketParticipant
from app.modules.market_validation.interviews.models import MarketInterview
from app.modules.market_validation.interviews.schemas import (
    InterviewCreate,
    InterviewUpdate,
)
from app.modules.market_validation.interviews.repository import InterviewRepository


class InterviewService:
    def __init__(self, repo: InterviewRepository | None = None):
        self.repo = repo or InterviewRepository()

    def create_interview(self, db: Session, payload: InterviewCreate) -> MarketInterview:
        participant = db.get(MarketParticipant, payload.participant_id)
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant {payload.participant_id} not found.",
            )
        if not participant.consent_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot conduct research interview without participant informed consent.",
            )

        interview = MarketInterview(
            id=uuid.uuid4(),
            participant_id=payload.participant_id,
            research_project=payload.research_project,
            interviewer=payload.interviewer,
            date=payload.date,
            duration_minutes=payload.duration_minutes,
            travel_context=payload.travel_context,
            destination=payload.destination,
            transcript_status=payload.transcript_status,
            recording_consent=payload.recording_consent,
            summary=payload.summary,
            key_findings=payload.key_findings,
        )
        return self.repo.create(db, interview)

    def get_interview(self, db: Session, interview_id: uuid.UUID) -> MarketInterview:
        interview = self.repo.get_by_id(db, interview_id)
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview {interview_id} not found.",
            )
        return interview

    def list_interviews(
        self,
        db: Session,
        participant_id: uuid.UUID | None = None,
        transcript_status: str | None = None,
        destination: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketInterview]]:
        return self.repo.list(
            db,
            participant_id=participant_id,
            transcript_status=transcript_status,
            destination=destination,
            limit=limit,
            offset=offset,
        )

    def update_interview(
        self,
        db: Session,
        interview_id: uuid.UUID,
        payload: InterviewUpdate,
    ) -> MarketInterview:
        interview = self.get_interview(db, interview_id)
        update_data = payload.model_dump(exclude_unset=True)

        new_status = update_data.get("transcript_status")
        if new_status and new_status != interview.transcript_status:
            # Validate lifecycle transition
            valid_order = ["PLANNED", "SCHEDULED", "CONDUCTED", "TRANSCRIBED", "ANALYZED", "ARCHIVED"]
            curr_idx = valid_order.index(interview.transcript_status) if interview.transcript_status in valid_order else 0
            new_idx = valid_order.index(new_status) if new_status in valid_order else 0
            if new_status != "ARCHIVED" and new_idx < curr_idx:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot transition interview backward from {interview.transcript_status} to {new_status}.",
                )

        for field, value in update_data.items():
            setattr(interview, field, value)
        return self.repo.update(db, interview)
