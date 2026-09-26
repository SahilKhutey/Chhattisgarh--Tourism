from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.expansion.models import ExpansionCandidate
from app.modules.market_validation.expansion.schemas import ExpansionCandidateCreate


class ExpansionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: ExpansionCandidateCreate) -> ExpansionCandidate:
        candidate = ExpansionCandidate(
            current_market_id=data.current_market_id,
            candidate_market_id=data.candidate_market_id,
            similarity_score=data.similarity_score,
            demand_score=data.demand_score,
            supply_score=data.supply_score,
            geographic_fit=data.geographic_fit,
            operational_fit=data.operational_fit,
            economic_fit=data.economic_fit,
            expansion_risk=data.expansion_risk,
            recommendation=data.recommendation,
        )
        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def list_by_current(self, current_market_id: str) -> list[ExpansionCandidate]:
        return (
            self.db.query(ExpansionCandidate)
            .filter(ExpansionCandidate.current_market_id == current_market_id)
            .all()
        )

    def list_all(self) -> list[ExpansionCandidate]:
        return self.db.query(ExpansionCandidate).all()

    def clear(self) -> None:
        self.db.query(ExpansionCandidate).delete()
        self.db.commit()
