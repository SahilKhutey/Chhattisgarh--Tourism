from __future__ import annotations

from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.modules.market_validation.transactions.models import (
    MarketTransaction,
    MarketTransactionFeedback,
)


class TransactionRepository:
    def create_transaction(self, db: Session, transaction: MarketTransaction) -> MarketTransaction:
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction

    def get_by_id(self, db: Session, tx_id: UUID | str) -> MarketTransaction | None:
        if isinstance(tx_id, UUID):
            return db.get(MarketTransaction, tx_id)
        try:
            val_uuid = UUID(tx_id)
            tx = db.get(MarketTransaction, val_uuid)
            if tx:
                return tx
        except (ValueError, AttributeError):
            pass
        stmt = select(MarketTransaction).where(MarketTransaction.transaction_id == str(tx_id))
        return db.execute(stmt).scalar_one_or_none()

    def get_by_booking_id(self, db: Session, booking_id: str) -> MarketTransaction | None:
        stmt = select(MarketTransaction).where(MarketTransaction.booking_id == booking_id)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_idempotency_key(self, db: Session, key: str) -> MarketTransaction | None:
        stmt = select(MarketTransaction).where(MarketTransaction.idempotency_key == key)
        return db.execute(stmt).scalar_one_or_none()

    def list_transactions(
        self,
        db: Session,
        provider_id: str | None = None,
        consumer_id: str | None = None,
        completion_status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[int, list[MarketTransaction]]:
        stmt = select(MarketTransaction)
        if provider_id:
            stmt = stmt.where(MarketTransaction.provider_id == provider_id)
        if consumer_id:
            stmt = stmt.where(MarketTransaction.consumer_id == consumer_id)
        if completion_status:
            stmt = stmt.where(MarketTransaction.completion_status == completion_status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        items = db.execute(
            stmt.order_by(desc(MarketTransaction.created_at)).limit(limit).offset(offset)
        ).scalars().all()
        return total, list(items)

    def update_transaction(self, db: Session, transaction: MarketTransaction) -> MarketTransaction:
        db.commit()
        db.refresh(transaction)
        return transaction

    def create_feedback(self, db: Session, feedback: MarketTransactionFeedback) -> MarketTransactionFeedback:
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    def list_feedback_for_transaction(
        self,
        db: Session,
        transaction_id: str,
    ) -> list[MarketTransactionFeedback]:
        stmt = (
            select(MarketTransactionFeedback)
            .where(MarketTransactionFeedback.transaction_id == transaction_id)
            .order_by(desc(MarketTransactionFeedback.created_at))
        )
        return list(db.execute(stmt).scalars().all())

    def list_all_feedback(
        self,
        db: Session,
        feedback_type: str | None = None,
        provider_id: str | None = None,
    ) -> list[MarketTransactionFeedback]:
        stmt = select(MarketTransactionFeedback)
        if feedback_type:
            stmt = stmt.where(MarketTransactionFeedback.feedback_type == feedback_type)
        if provider_id:
            stmt = stmt.where(MarketTransactionFeedback.provider_id == provider_id)
        return list(db.execute(stmt.order_by(desc(MarketTransactionFeedback.created_at))).scalars().all())
