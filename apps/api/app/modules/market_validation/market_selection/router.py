from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.auth import require_pilot_operator, AuthUser
from app.modules.market_validation.market_selection.schemas import MarketCandidateCreate, MarketCandidateResponse
from app.modules.market_validation.market_selection.service import MarketSelectionService

router = APIRouter(prefix="/market-selection", tags=["market-validation-market-selection"])


@router.get("", response_model=list[MarketCandidateResponse])
def get_market_selection_matrix(db: Session = Depends(get_db)):
    service = MarketSelectionService(db)
    return service.get_market_selection()


@router.post("", response_model=MarketCandidateResponse, status_code=status.HTTP_201_CREATED)
def add_market_candidate(
    data: MarketCandidateCreate,
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = MarketSelectionService(db)
    return service.add_market_candidate(data)


@router.post("/reseed", response_model=list[MarketCandidateResponse])
def reseed_market_selection(
    db: Session = Depends(get_db),
    user: AuthUser = Depends(require_pilot_operator),
):
    service = MarketSelectionService(db)
    candidates = service.seed_baseline_markets()
    return service.get_market_selection()
