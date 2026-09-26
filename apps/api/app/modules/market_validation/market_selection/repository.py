from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.market_selection.models import MarketCandidate
from app.modules.market_validation.market_selection.schemas import MarketCandidateCreate


class MarketSelectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: MarketCandidateCreate, priority: int, recommendation: str) -> MarketCandidate:
        candidate = MarketCandidate(
            geography_id=data.geography_id,
            demand_score=data.demand_score,
            supply_score=data.supply_score,
            content_score=data.content_score,
            geographic_score=data.geographic_score,
            accessibility_score=data.accessibility_score,
            operational_score=data.operational_score,
            risk_score=data.risk_score,
            evidence_strength=data.evidence_strength,
            pilot_priority=priority,
            recommendation=recommendation,
            evidence_ids=data.evidence_ids,
        )
        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def get_by_geography(self, geography_id: str) -> MarketCandidate | None:
        return self.db.query(MarketCandidate).filter(MarketCandidate.geography_id == geography_id).first()

    def list_all(self) -> list[MarketCandidate]:
        return self.db.query(MarketCandidate).order_by(MarketCandidate.pilot_priority.asc()).all()

    def clear(self) -> None:
        self.db.query(MarketCandidate).delete()
        self.db.commit()
