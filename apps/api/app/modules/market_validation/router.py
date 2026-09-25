from __future__ import annotations

from fastapi import APIRouter

from app.modules.market_validation.participants.router import router as participants_router
from app.modules.market_validation.interviews.router import router as interviews_router
from app.modules.market_validation.problems.router import router as problems_router
from app.modules.market_validation.evidence.router import router as evidence_router
from app.modules.market_validation.jobs.router import router as jobs_router
from app.modules.market_validation.validation.router import router as validation_router
from app.modules.market_validation.analysis.router import router as analysis_router

market_validation_router = APIRouter(
    prefix="/v1/market-validation",
    tags=["market-validation"],
)

market_validation_router.include_router(participants_router)
market_validation_router.include_router(interviews_router)
market_validation_router.include_router(problems_router)
market_validation_router.include_router(evidence_router)
market_validation_router.include_router(jobs_router)
market_validation_router.include_router(validation_router)
market_validation_router.include_router(analysis_router)
