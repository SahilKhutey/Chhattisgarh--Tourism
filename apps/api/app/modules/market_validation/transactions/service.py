from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.transactions.models import (
    MarketTransaction,
    MarketTransactionFeedback,
)
from app.modules.market_validation.transactions.schemas import (
    TransactionCreate,
    TransactionCompleteRequest,
    TransactionFeedbackCreate,
)
from app.modules.market_validation.transactions.repository import TransactionRepository


class TransactionService:
    def __init__(self, repo: TransactionRepository | None = None):
        self.repo = repo or TransactionRepository()

    def create_transaction(
        self,
        db: Session,
        payload: TransactionCreate,
        idempotency_key: str | None = None,
    ) -> MarketTransaction:
        key = idempotency_key or payload.idempotency_key
        if key:
            existing = self.repo.get_by_idempotency_key(db, key)
            if existing:
                return existing

        now = datetime.now(timezone.utc)
        tx = MarketTransaction(
            id=uuid.uuid4(),
            transaction_id=f"TXN_{uuid.uuid4().hex[:12].upper()}",
            booking_id=payload.booking_id,
            provider_id=payload.provider_id,
            consumer_id=payload.consumer_id,
            gross_amount=payload.gross_amount,
            currency=payload.currency,
            completion_status=payload.completion_status,
            idempotency_key=key,
            created_at=now,
        )
        return self.repo.create_transaction(db, tx)

    def get_transaction(self, db: Session, tx_id: str) -> MarketTransaction:
        tx = self.repo.get_by_id(db, tx_id)
        if not tx:
            # Fallback check by booking_id
            tx = self.repo.get_by_booking_id(db, tx_id)
        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction {tx_id} not found.",
            )
        return tx

    def list_transactions(
        self,
        db: Session,
        provider_id: str | None = None,
        consumer_id: str | None = None,
        completion_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketTransaction]]:
        return self.repo.list_transactions(
            db,
            provider_id=provider_id,
            consumer_id=consumer_id,
            completion_status=completion_status,
            limit=limit,
            offset=offset,
        )

    def complete_transaction(
        self,
        db: Session,
        tx_id: str,
        payload: TransactionCompleteRequest,
    ) -> MarketTransaction:
        tx = self.get_transaction(db, tx_id)
        now = datetime.now(timezone.utc)

        if payload.completion_status == "COMPLETED":
            if payload.role == "PROVIDER":
                tx.provider_confirmed = True
            elif payload.role == "CONSUMER":
                tx.consumer_confirmed = True
            else:
                tx.provider_confirmed = True
                tx.consumer_confirmed = True

            # Mark completed if confirmed
            tx.completion_status = "COMPLETED"
            tx.completed_at = now
        else:
            tx.completion_status = payload.completion_status
            tx.failure_reason = payload.failure_reason or "OTHER"

        return self.repo.update_transaction(db, tx)

    def submit_feedback(
        self,
        db: Session,
        tx_id: str,
        payload: TransactionFeedbackCreate,
    ) -> MarketTransactionFeedback:
        # Verify transaction exists
        tx = self.get_transaction(db, tx_id)
        feedback = MarketTransactionFeedback(
            id=uuid.uuid4(),
            transaction_id=tx.transaction_id,
            provider_id=payload.provider_id,
            consumer_id=payload.consumer_id,
            feedback_type=payload.feedback_type,
            lead_quality_score=payload.lead_quality_score,
            relevance_score=payload.relevance_score,
            operational_effort_score=payload.operational_effort_score,
            economic_value_score=payload.economic_value_score,
            continuation_intent=payload.continuation_intent,
            satisfaction_score=payload.satisfaction_score,
            notes=payload.notes,
            created_at=datetime.now(timezone.utc),
        )
        return self.repo.create_feedback(db, feedback)

    def list_feedback(
        self,
        db: Session,
        tx_id: str,
    ) -> list[MarketTransactionFeedback]:
        tx = self.get_transaction(db, tx_id)
        return self.repo.list_feedback_for_transaction(db, tx.transaction_id)
