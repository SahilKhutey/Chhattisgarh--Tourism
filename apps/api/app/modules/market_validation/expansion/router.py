from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.market_validation.expansion.schemas import ExpansionCandidateResponse
from app.modules.market_validation.expansion.service import ExpansionService

router = APIRouter(prefix="/expansion", tags=["market-validation-expansion"])


@router.get("", response_model=list[ExpansionCandidateResponse])
def get_expansion_candidates(
    current_market: str = Query("Bastar"),
    db: Session = Depends(get_db),
):
    service = ExpansionService(db)
    return service.list_expansion_candidates(current_market=current_market)
