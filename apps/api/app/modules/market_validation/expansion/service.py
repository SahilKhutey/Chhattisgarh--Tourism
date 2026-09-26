from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.expansion.models import ExpansionCandidate
from app.modules.market_validation.expansion.repository import ExpansionRepository
from app.modules.market_validation.expansion.schemas import (
    ExpansionCandidateCreate,
    ExpansionCandidateResponse,
)


class ExpansionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExpansionRepository(db)

    def calculate_expansion_score(self, item: ExpansionCandidate | ExpansionCandidateCreate) -> float:
        # Transferability formula: similarity (20%) + demand (25%) + supply (20%) + geo (15%) + ops (10%) + econ (10%) - risk penalty (15%)
        raw = (
            item.similarity_score * 0.20
            + item.demand_score * 0.25
            + item.supply_score * 0.20
            + item.geographic_fit * 0.15
            + item.operational_fit * 0.10
            + item.economic_fit * 0.10
            - item.expansion_risk * 0.15
        )
        return round(max(0.0, min(100.0, raw)), 2)

    def seed_baseline_candidates(self) -> list[ExpansionCandidate]:
        candidates = [
            ExpansionCandidateCreate(
                current_market_id="Bastar",
                candidate_market_id="Surguja",
                similarity_score=78.0,
                demand_score=70.0,
                supply_score=62.0,
                geographic_fit=75.0,
                operational_fit=65.0,
                economic_fit=68.0,
                expansion_risk=22.0,
                recommendation="RECOMMENDED_NEXT_EXPANSION",
            ),
            ExpansionCandidateCreate(
                current_market_id="Bastar",
                candidate_market_id="Bilaspur",
                similarity_score=60.0,
                demand_score=64.0,
                supply_score=66.0,
                geographic_fit=62.0,
                operational_fit=70.0,
                economic_fit=65.0,
                expansion_risk=20.0,
                recommendation="SECONDARY_EXPANSION",
            ),
            ExpansionCandidateCreate(
                current_market_id="Bastar",
                candidate_market_id="Raipur",
                similarity_score=45.0,
                demand_score=72.0,
                supply_score=80.0,
                geographic_fit=50.0,
                operational_fit=82.0,
                economic_fit=75.0,
                expansion_risk=15.0,
                recommendation="COMMERCIAL_GATEWAY_HUB",
            ),
        ]
        self.repo.clear()
        created = []
        for c in candidates:
            created.append(self.repo.create(c))
        return created

    def list_expansion_candidates(self, current_market: str = "Bastar") -> list[ExpansionCandidateResponse]:
        candidates = self.repo.list_by_current(current_market)
        if not candidates:
            self.seed_baseline_candidates()
            candidates = self.repo.list_by_current(current_market)

        scored = []
        for c in candidates:
            score = self.calculate_expansion_score(c)
            resp = ExpansionCandidateResponse.model_validate(c)
            resp.composite_expansion_score = score
            scored.append(resp)

        scored.sort(key=lambda x: x.composite_expansion_score, reverse=True)
        return scored
