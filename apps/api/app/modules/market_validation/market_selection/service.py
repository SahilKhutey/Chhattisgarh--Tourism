from __future__ import annotations

from sqlalchemy.orm import Session
from app.modules.market_validation.market_selection.models import MarketCandidate
from app.modules.market_validation.market_selection.repository import MarketSelectionRepository
from app.modules.market_validation.market_selection.schemas import MarketCandidateCreate, MarketCandidateResponse


class MarketSelectionService:
    # Multi-factor weights
    WEIGHTS = {
        "demand": 0.25,
        "supply": 0.20,
        "content": 0.15,
        "geographic": 0.15,
        "accessibility": 0.10,
        "operational": 0.10,
        "risk_penalty": 0.15,
    }

    def __init__(self, db: Session):
        self.db = db
        self.repo = MarketSelectionRepository(db)

    def calculate_composite_score(self, candidate: MarketCandidate | MarketCandidateCreate) -> float:
        demand = candidate.demand_score * self.WEIGHTS["demand"]
        supply = candidate.supply_score * self.WEIGHTS["supply"]
        content = candidate.content_score * self.WEIGHTS["content"]
        geo = candidate.geographic_score * self.WEIGHTS["geographic"]
        access = candidate.accessibility_score * self.WEIGHTS["accessibility"]
        ops = candidate.operational_score * self.WEIGHTS["operational"]
        risk_penalty = candidate.risk_score * self.WEIGHTS["risk_penalty"]

        raw = demand + supply + content + geo + access + ops - risk_penalty
        return round(max(0.0, min(100.0, raw)), 2)

    def determine_recommendation(self, composite_score: float, risk_score: float) -> str:
        if risk_score > 60.0:
            return "DEFERRED_DUE_TO_RISK"
        if composite_score >= 65.0:
            return "RECOMMENDED_PILOT"
        if composite_score >= 50.0:
            return "SECONDARY_EXPANSION_CANDIDATE"
        return "LOW_READINESS"

    def seed_baseline_markets(self) -> list[MarketCandidate]:
        candidates_data = [
            MarketCandidateCreate(
                geography_id="Bastar",
                demand_score=88.0,
                supply_score=78.0,
                content_score=85.0,
                geographic_score=90.0,
                accessibility_score=68.0,
                operational_score=75.0,
                risk_score=24.0,
                evidence_strength="STRONG",
                evidence_ids=["MV2-EV-BASTAR-01", "MV3-EV-BASTAR-02", "MV4-EV-BASTAR-03"],
            ),
            MarketCandidateCreate(
                geography_id="Surguja",
                demand_score=68.0,
                supply_score=60.0,
                content_score=65.0,
                geographic_score=72.0,
                accessibility_score=62.0,
                operational_score=58.0,
                risk_score=28.0,
                evidence_strength="MODERATE",
                evidence_ids=["MV2-EV-SURGUJA-01", "MV4-EV-SURGUJA-02"],
            ),
            MarketCandidateCreate(
                geography_id="Bilaspur",
                demand_score=62.0,
                supply_score=65.0,
                content_score=58.0,
                geographic_score=64.0,
                accessibility_score=80.0,
                operational_score=62.0,
                risk_score=20.0,
                evidence_strength="MODERATE",
                evidence_ids=["MV3-EV-BILASPUR-01"],
            ),
            MarketCandidateCreate(
                geography_id="Raipur",
                demand_score=70.0,
                supply_score=82.0,
                content_score=60.0,
                geographic_score=55.0,
                accessibility_score=92.0,
                operational_score=80.0,
                risk_score=15.0,
                evidence_strength="MODERATE",
                evidence_ids=["MV1-EV-RAIPUR-01", "MV7-EV-RAIPUR-02"],
            ),
        ]

        scored = []
        for c in candidates_data:
            comp = self.calculate_composite_score(c)
            rec = self.determine_recommendation(comp, c.risk_score)
            scored.append((c, comp, rec))

        # Sort by composite score descending
        scored.sort(key=lambda x: x[1], reverse=True)

        self.repo.clear()
        created = []
        for rank, (c, _, rec) in enumerate(scored, start=1):
            created.append(self.repo.create(c, priority=rank, recommendation=rec))
        return created

    def get_market_selection(self) -> list[MarketCandidateResponse]:
        candidates = self.repo.list_all()
        if not candidates:
            candidates = self.seed_baseline_markets()

        results = []
        for c in candidates:
            comp = self.calculate_composite_score(c)
            resp = MarketCandidateResponse.model_validate(c)
            resp.composite_score = comp
            results.append(resp)
        return results

    def add_market_candidate(self, data: MarketCandidateCreate) -> MarketCandidateResponse:
        comp = self.calculate_composite_score(data)
        rec = self.determine_recommendation(comp, data.risk_score)
        existing = self.repo.list_all()
        priority = len(existing) + 1
        candidate = self.repo.create(data, priority=priority, recommendation=rec)
        resp = MarketCandidateResponse.model_validate(candidate)
        resp.composite_score = comp
        return resp
