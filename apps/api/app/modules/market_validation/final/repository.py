from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.final.models import (
    MarketValidationEvidenceSnapshot,
    MarketValidationDecision,
    MarketValidationRisk,
)


class FinalRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_snapshot(self, snapshot: MarketValidationEvidenceSnapshot) -> MarketValidationEvidenceSnapshot:
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def get_latest_snapshot(self) -> MarketValidationEvidenceSnapshot | None:
        return (
            self.db.query(MarketValidationEvidenceSnapshot)
            .order_by(MarketValidationEvidenceSnapshot.generated_at.desc())
            .first()
        )

    def save_decision(self, decision: MarketValidationDecision) -> MarketValidationDecision:
        self.db.add(decision)
        self.db.commit()
        self.db.refresh(decision)
        return decision

    def get_latest_decision(self) -> MarketValidationDecision | None:
        return (
            self.db.query(MarketValidationDecision)
            .order_by(MarketValidationDecision.decided_at.desc())
            .first()
        )

    def list_decisions(self) -> list[MarketValidationDecision]:
        return (
            self.db.query(MarketValidationDecision)
            .order_by(MarketValidationDecision.version.desc())
            .all()
        )

    def list_risks(self) -> list[MarketValidationRisk]:
        return (
            self.db.query(MarketValidationRisk)
            .order_by(MarketValidationRisk.impact.desc())
            .all()
        )

    def add_risk(self, risk: MarketValidationRisk) -> MarketValidationRisk:
        self.db.add(risk)
        self.db.commit()
        self.db.refresh(risk)
        return risk
