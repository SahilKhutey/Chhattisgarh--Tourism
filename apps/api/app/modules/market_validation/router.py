from __future__ import annotations

from fastapi import APIRouter

# MV2: Consumer Problem Validation
from app.modules.market_validation.participants.router import router as participants_router
from app.modules.market_validation.interviews.router import router as interviews_router
from app.modules.market_validation.problems.router import router as problems_router
from app.modules.market_validation.evidence.router import router as evidence_router
from app.modules.market_validation.jobs.router import router as jobs_router
from app.modules.market_validation.validation.router import router as validation_router
from app.modules.market_validation.analysis.router import router as analysis_router

# MV3: Tourism Supply-Side Validation
from app.modules.market_validation.providers.router import router as providers_router
from app.modules.market_validation.onboarding.router import router as onboarding_router
from app.modules.market_validation.listings.router import router as listings_router
from app.modules.market_validation.leads.router import router as leads_router
from app.modules.market_validation.provider_feedback.router import router as provider_feedback_router
from app.modules.market_validation.provider_metrics.router import router as provider_metrics_router

# MV4: Regional & Geographic Validation
from app.modules.market_validation.geographic.router import router as destinations_router
from app.modules.market_validation.geo_relationships.router import router as relationships_router
from app.modules.market_validation.geo_experiments.router import router as geo_experiments_router
from app.modules.market_validation.route_validation.router import router as route_validation_router
from app.modules.market_validation.geo_analysis.router import router as geo_analysis_router

market_validation_router = APIRouter(
    prefix="/v1/market-validation",
    tags=["market-validation"],
)

# MV2: Consumer Problem Validation
market_validation_router.include_router(participants_router)
market_validation_router.include_router(interviews_router)
market_validation_router.include_router(problems_router)
market_validation_router.include_router(evidence_router)
market_validation_router.include_router(jobs_router)
market_validation_router.include_router(validation_router)
market_validation_router.include_router(analysis_router)

# MV3: Tourism Supply-Side Validation
market_validation_router.include_router(providers_router)
market_validation_router.include_router(onboarding_router)
market_validation_router.include_router(listings_router)
market_validation_router.include_router(leads_router)
market_validation_router.include_router(provider_feedback_router)
market_validation_router.include_router(provider_metrics_router)

# MV4: Regional & Geographic Validation
geography_router = APIRouter(
    prefix="/geography",
    tags=["market-validation-geography"],
)
geography_router.include_router(destinations_router)
geography_router.include_router(relationships_router)
geography_router.include_router(geo_experiments_router)
geography_router.include_router(route_validation_router)
geography_router.include_router(geo_analysis_router)

market_validation_router.include_router(geography_router)

# MV5: Content & Discovery Validation
from app.modules.market_validation.content.router import router as content_entries_router
from app.modules.market_validation.content_evidence.router import router as content_evidence_router
from app.modules.market_validation.trust.router import router as content_trust_router
from app.modules.market_validation.content_experiments.router import router as content_experiments_router
from app.modules.market_validation.discovery.router import router as discovery_router
from app.modules.market_validation.content_analysis.router import router as content_analysis_router
from app.modules.market_validation.transactions.router import router as transactions_router

market_validation_router.include_router(content_entries_router)
market_validation_router.include_router(content_evidence_router)
market_validation_router.include_router(content_trust_router)
market_validation_router.include_router(content_experiments_router)
market_validation_router.include_router(discovery_router)
market_validation_router.include_router(content_analysis_router)
market_validation_router.include_router(transactions_router, prefix="/transactions")

# MV8: Retention, Repeat Usage & Network Effects
from app.modules.market_validation.retention.router import router as retention_router
market_validation_router.include_router(retention_router)

# MV9: Business Model, Monetization & Unit Economics
from app.modules.market_validation.business_model.router import router as business_router
market_validation_router.include_router(business_router)

# MV11: Post-Validation Pilot, Scale Readiness & Market Launch Execution
from app.modules.market_validation.pilot.router import router as pilot_router
from app.modules.market_validation.market_selection.router import router as market_selection_router
from app.modules.market_validation.launch_readiness.router import router as launch_readiness_router
from app.modules.market_validation.scale_gates.router import router as scale_gates_router
from app.modules.market_validation.launch_controls.router import router as launch_controls_router
from app.modules.market_validation.operational_readiness.router import router as operational_readiness_router
from app.modules.market_validation.expansion.router import router as expansion_router

market_validation_router.include_router(pilot_router)
market_validation_router.include_router(market_selection_router)
market_validation_router.include_router(launch_readiness_router)
market_validation_router.include_router(scale_gates_router)
market_validation_router.include_router(launch_controls_router)
market_validation_router.include_router(operational_readiness_router)
market_validation_router.include_router(expansion_router)

# MV13: Final Integration, Production Sign-Off & Market Validation Release
from app.modules.market_validation.final.router import router as final_router
market_validation_router.include_router(final_router)



