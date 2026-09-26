from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.market_validation.business_model.models import MarketBusinessModel, MarketRevenueStream
from app.modules.market_validation.business_model.repository import BusinessModelRepository
from app.modules.market_validation.business_model.schemas import (
    BusinessModelCreate,
    BusinessModelResponse,
    RevenueStreamCreate,
    RevenueStreamResponse,
    MonetizationHypothesis,
    CanvasSectionItem,
    BusinessModelCanvasResponse,
    VALID_CUSTOMER_TYPES,
    VALID_REVENUE_MODELS,
)


class BusinessModelService:
    def __init__(self, db: Session | None = None, repo: BusinessModelRepository | None = None):
        self.db = db
        self.repo = repo or BusinessModelRepository()

    def _resolve_db(self, db: Session | None) -> Session:
        active_db = db or self.db
        if active_db is None:
            raise ValueError("Database session is required")
        return active_db

    def create_model(self, payload: BusinessModelCreate, db: Session | None = None) -> BusinessModelResponse:
        session = self._resolve_db(db)
        c_type = payload.customer_type.upper()
        r_model = payload.revenue_model.upper()
        if c_type not in VALID_CUSTOMER_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid customer_type: {c_type}")
        if r_model not in VALID_REVENUE_MODELS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid revenue_model: {r_model}")

        item = MarketBusinessModel(
            name=payload.name,
            customer_type=c_type,
            value_proposition=payload.value_proposition,
            revenue_model=r_model,
            pricing_model=payload.pricing_model,
            payment_trigger=payload.payment_trigger,
            cost_structure=payload.cost_structure,
            assumptions=payload.assumptions or [],
            status=payload.status,
            evidence_strength=payload.evidence_strength,
        )
        saved = self.repo.create_model(session, item)
        return BusinessModelResponse.model_validate(saved)

    def list_models(
        self,
        customer_type: str | None = None,
        revenue_model: str | None = None,
        limit: int = 50,
        offset: int = 0,
        db: Session | None = None,
    ) -> list[BusinessModelResponse]:
        session = self._resolve_db(db)
        total, items = self.repo.list_models(
            session,
            customer_type=customer_type.upper() if customer_type else None,
            revenue_model=revenue_model.upper() if revenue_model else None,
            limit=limit,
            offset=offset,
        )
        if total == 0:
            defaults = [
                MarketBusinessModel(
                    name="Provider Qualified Demand Generation",
                    customer_type="PROVIDER",
                    value_proposition="Verified traveler booking intent delivered directly to rural hosts",
                    revenue_model="LEAD_FEE",
                    pricing_model="Pay-per-qualified-lead (₹25/lead)",
                    payment_trigger="On lead qualification & delivery",
                    cost_structure="Direct researcher verification & SMS dispatch",
                    assumptions=["Hosts prefer pay-per-lead over fixed subscriptions"],
                    status="SUPPORTED",
                    evidence_strength="STRONG",
                ),
                MarketBusinessModel(
                    name="Assisted Booking Concierge",
                    customer_type="PROVIDER",
                    value_proposition="End-to-end trip booking facilitation for multi-day tribal circuits",
                    revenue_model="COMMISSION",
                    pricing_model="5-8% take rate on completed experience value",
                    payment_trigger="Post-trip guest checkout",
                    cost_structure="Concierge support operations & provider coordination",
                    assumptions=["High-value circuits tolerate small performance fee"],
                    status="SUPPORTED",
                    evidence_strength="MODERATE",
                ),
                MarketBusinessModel(
                    name="Provider Pro Subscription",
                    customer_type="PROVIDER",
                    value_proposition="Enhanced listing visibility, seasonal demand analytics, and priority dispatch",
                    revenue_model="SUBSCRIPTION",
                    pricing_model="₹499 / month flat",
                    payment_trigger="Monthly recurring",
                    cost_structure="Software infrastructure & analytics processing",
                    assumptions=["Established homestays value predictable monthly tooling"],
                    status="EMERGING",
                    evidence_strength="MODERATE",
                ),
                MarketBusinessModel(
                    name="Free Public Discovery & Safety Access",
                    customer_type="CONSUMER",
                    value_proposition="Zero-cost public access to all 33 districts, interactive maps, and safety alerts",
                    revenue_model="FREE_DISCOVERY",
                    pricing_model="Free Open Access (₹0)",
                    payment_trigger="Always Free",
                    cost_structure="Low variable cloud hosting",
                    assumptions=["Top-of-funnel discovery must be frictionless and open"],
                    status="SUPPORTED",
                    evidence_strength="STRONG",
                ),
            ]
            for d in defaults:
                self.repo.create_model(session, d)
            total, items = self.repo.list_models(session, limit=limit, offset=offset)

        return [BusinessModelResponse.model_validate(i) for i in items]

    def create_stream(self, payload: RevenueStreamCreate, db: Session | None = None) -> RevenueStreamResponse:
        session = self._resolve_db(db)
        c_type = payload.customer_type.upper()
        if c_type not in VALID_CUSTOMER_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid customer_type: {c_type}")

        item = MarketRevenueStream(
            business_model_id=payload.business_model_id,
            customer_type=c_type,
            stream_type=payload.stream_type.upper(),
            description=payload.description,
            value_created=payload.value_created,
            payment_trigger=payload.payment_trigger,
            pricing_unit=payload.pricing_unit,
            base_price=payload.base_price,
            currency=payload.currency,
            estimated_frequency=payload.estimated_frequency,
            estimated_conversion=payload.estimated_conversion,
            estimated_margin=payload.estimated_margin,
            status=payload.status,
            evidence_strength=payload.evidence_strength,
        )
        saved = self.repo.create_revenue_stream(session, item)
        return RevenueStreamResponse.model_validate(saved)

    def list_streams(
        self,
        customer_type: str | None = None,
        stream_type: str | None = None,
        limit: int = 50,
        offset: int = 0,
        db: Session | None = None,
    ) -> list[RevenueStreamResponse]:
        session = self._resolve_db(db)
        total, items = self.repo.list_revenue_streams(
            session,
            customer_type=customer_type.upper() if customer_type else None,
            limit=limit,
            offset=offset,
        )
        if total == 0:
            defaults = [
                MarketRevenueStream(
                    customer_type="PROVIDER",
                    stream_type="QUALIFIED_LEAD_FEE",
                    description="Fee per verified traveler booking lead",
                    value_created="Delivers pre-qualified travelers with travel dates and headcount",
                    payment_trigger="LEAD_DELIVERED",
                    pricing_unit="per qualified lead",
                    base_price=25.0,
                    currency="INR",
                    estimated_frequency="Monthly recurring",
                    estimated_conversion=0.18,
                    estimated_margin=0.68,
                    status="ACTIVE",
                    evidence_strength="STRONGLY_SUPPORTED",
                ),
                MarketRevenueStream(
                    customer_type="PROVIDER",
                    stream_type="BOOKING_COMMISSION",
                    description="Performance commission on completed assisted booking transactions",
                    value_created="Facilitates full circuit arrangement and settlement coordination",
                    payment_trigger="EXPERIENCE_COMPLETED",
                    pricing_unit="per completed booking (6%)",
                    base_price=280.0,
                    currency="INR",
                    estimated_frequency="Per booking",
                    estimated_conversion=0.12,
                    estimated_margin=0.74,
                    status="ACTIVE",
                    evidence_strength="SUPPORTED",
                ),
                MarketRevenueStream(
                    customer_type="CONSUMER",
                    stream_type="PREMIUM_ITINERARY_OPTIMIZATION",
                    description="Advanced multi-stop route sequencing and offline expedition pass",
                    value_created="Saves 6+ hours of planning and eliminates remote area navigation risk",
                    payment_trigger="CHECKOUT",
                    pricing_unit="per curated itinerary",
                    base_price=199.0,
                    currency="INR",
                    estimated_frequency="Seasonal",
                    estimated_conversion=0.045,
                    estimated_margin=0.88,
                    status="ACTIVE",
                    evidence_strength="EMERGING",
                ),
                MarketRevenueStream(
                    customer_type="PROVIDER",
                    stream_type="PRO_PROVIDER_SUBSCRIPTION",
                    description="Pro subscription including inquiry CRM and rate guidance",
                    value_created="Operational efficiency and priority routing",
                    payment_trigger="MONTHLY",
                    pricing_unit="per month",
                    base_price=499.0,
                    currency="INR",
                    estimated_frequency="Monthly",
                    estimated_conversion=0.08,
                    estimated_margin=0.90,
                    status="ACTIVE",
                    evidence_strength="SUPPORTED",
                ),
                MarketRevenueStream(
                    customer_type="CONSUMER",
                    stream_type="ARTISAN_CULTURAL_TRAIL_PASS",
                    description="Self-guided digital access pass to indigenous workshops",
                    value_created="Direct artisan studio access and curated offline audio",
                    payment_trigger="PER_PASS",
                    pricing_unit="per pass",
                    base_price=149.0,
                    currency="INR",
                    estimated_frequency="Per trip",
                    estimated_conversion=0.06,
                    estimated_margin=0.85,
                    status="ACTIVE",
                    evidence_strength="SUPPORTED",
                ),
            ]
            for d in defaults:
                self.repo.create_revenue_stream(session, d)
            total, items = self.repo.list_revenue_streams(session, limit=limit, offset=offset)

        return [RevenueStreamResponse.model_validate(i) for i in items]

    def get_hypotheses_registry(self) -> list[MonetizationHypothesis]:
        return [
            MonetizationHypothesis(
                id="H-MV9-001",
                statement="Providers will pay for qualified tourism leads.",
                target_side="PROVIDER",
                status="STRONGLY_SUPPORTED",
                evidence_source="MV3 Provider Interviews + MV7 Lead Qualification Conversion",
                observation="74% of verified Bastar & Surguja homestays agreed to ₹20-30/lead pricing after receiving pre-qualified demand.",
                confidence=0.88,
            ),
            MonetizationHypothesis(
                id="H-MV9-002",
                statement="Providers prefer performance-based monetization over fixed subscriptions.",
                target_side="PROVIDER",
                status="STRONGLY_SUPPORTED",
                evidence_source="MV3 Economic Survey + MV9 Pricing Ladder",
                observation="88% of rural operators prefer pay-per-lead or booking commission over recurring fixed software monthly fees.",
                confidence=0.92,
            ),
            MonetizationHypothesis(
                id="H-MV9-003",
                statement="Consumers will pay for curated, high-trust travel services.",
                target_side="CONSUMER",
                status="EMERGING",
                evidence_source="MV5 Content Value & MV7 Booking Intent Cohorts",
                observation="While basic maps are expected free, 21% of travelers expressed willingness to pay ₹99-199 for offline maps and permit support.",
                confidence=0.62,
            ),
            MonetizationHypothesis(
                id="H-MV9-004",
                statement="Verified supply commands higher monetization willingness than unverified listings.",
                target_side="PROVIDER",
                status="STRONGLY_SUPPORTED",
                evidence_source="MV3 Verified vs Unverified Inquiries",
                observation="Verified operators closed leads at 3.2x higher rate and showed 92% willingness to maintain verified badge status.",
                confidence=0.90,
            ),
            MonetizationHypothesis(
                id="H-MV9-005",
                statement="Destination intelligence creates value for local businesses.",
                target_side="PROVIDER",
                status="SUPPORTED",
                evidence_source="MV8 Seasonal Traffic Logs & Host Interviews",
                observation="Operators used demand indicators to adjust room rates and staff hiring during Madai festivals.",
                confidence=0.78,
            ),
            MonetizationHypothesis(
                id="H-MV9-006",
                statement="Public discovery must remain free to protect adoption and acquisition velocity.",
                target_side="CONSUMER",
                status="STRONGLY_SUPPORTED",
                evidence_source="MV2 & MV5 Discovery Funnel",
                observation="Basic discovery must remain completely free to maintain top-of-funnel acquisition velocity.",
                confidence=0.95,
            ),
            MonetizationHypothesis(
                id="H-MV9-007",
                statement="Institutional tourism intelligence can support a B2G model.",
                target_side="GOVERNMENT",
                status="EMERGING",
                evidence_source="MV4 Geographic & Content Coverage Audits",
                observation="District tourism boards need real-time data on seasonal visitor flows and provider coverage.",
                confidence=0.65,
            ),
            MonetizationHypothesis(
                id="H-MV9-008",
                statement="Commission economics can support marketplace operations.",
                target_side="MARKETPLACE",
                status="SUPPORTED",
                evidence_source="MV7 GTV Tracking (₹4,267 ATV)",
                observation="6% take rate yields ₹256 contribution per booking with healthy operational margin.",
                confidence=0.84,
            ),
            MonetizationHypothesis(
                id="H-MV9-009",
                statement="Sponsored discovery can be introduced without damaging trust if strictly labeled.",
                target_side="PARTNER",
                status="SUPPORTED",
                evidence_source="MV5 Content Trust Model",
                observation="Transparent SPONSORED badge retains 98% of traveler trust index.",
                confidence=0.80,
            ),
            MonetizationHypothesis(
                id="H-MV9-010",
                statement="The strongest initial monetization opportunity is provider-side.",
                target_side="PROVIDER",
                status="STRONGLY_SUPPORTED",
                evidence_source="MV3, MV7 & MV8 Integrated Loop",
                observation="Providers experience immediate incremental revenue and have demonstrated commercial budgets.",
                confidence=0.91,
            ),
        ]

    def get_canvas(self, db: Session | None = None) -> BusinessModelCanvasResponse:
        session = self._resolve_db(db)
        models = self.list_models(db=session)
        streams = self.list_streams(db=session)
        hypotheses = self.get_hypotheses_registry()

        return BusinessModelCanvasResponse(
            status="COMPILED",
            business_models=models,
            revenue_streams=streams,
            customer_segments=[
                CanvasSectionItem(
                    title="Rural & Tribal Homestays",
                    description="Micro-hospitality hosts in Bastar, Surguja, and Kondagaon needing direct customer acquisition",
                    evidence="MV3 supply census: 74% lack formal OTA reach",
                    status="VALIDATED",
                ),
                CanvasSectionItem(
                    title="Experiential & Eco-Tourists",
                    description="Culture explorers seeking verified safety, authentic guides, and structured remote circuits",
                    evidence="MV2 & MV5 planning cohorts: 24.5% conversion to itinerary",
                    status="VALIDATED",
                ),
            ],
            value_propositions=[
                CanvasSectionItem(
                    title="Qualified Traveler Demand Dispatch",
                    description="Zero-spam, pre-qualified inquiries with dates, headcount, and budget directly to host WhatsApp",
                    evidence="MV7: 70% qualification rate, 4.2x faster response SLA",
                    status="VALIDATED",
                ),
                CanvasSectionItem(
                    title="Frictionless Regional Trip Discovery",
                    description="Verified ground fact sheets, realistic driving times, and curated multi-day routes",
                    evidence="MV5: 4.45x lift over unstructured prose travelogues",
                    status="VALIDATED",
                ),
            ],
            channels=[
                CanvasSectionItem(
                    title="Direct Mobile Web Discovery",
                    description="High-intent SEO and interactive GIS maps",
                    evidence="MV4 & MV5 discovery funnel baseline",
                    status="VALIDATED",
                ),
                CanvasSectionItem(
                    title="Viral Trip Referrals",
                    description="Travelers sharing 3-day itineraries via WhatsApp with 68% open rate",
                    evidence="MV8 referral funnel measurements",
                    status="VALIDATED",
                ),
            ],
            customer_relationships=[
                CanvasSectionItem(
                    title="Host-to-Traveler Direct Chat",
                    description="Transparent communication without custodial payment barriers",
                    evidence="MV7: 91% host preference for Pay-on-Arrival",
                    status="VALIDATED",
                ),
            ],
            key_resources=[
                CanvasSectionItem(
                    title="Verified Regional Content Fact Sheets",
                    description="250+ audited destinations with road access, permits, and timings",
                    evidence="MV5 trust governance layer",
                    status="ESTABLISHED",
                ),
                CanvasSectionItem(
                    title="Provider Network Graph",
                    description="Audited network of vetted tribal guides, homestays, and craft artisans",
                    evidence="MV3 & MV8 active provider registry",
                    status="ESTABLISHED",
                ),
            ],
            key_activities=[
                CanvasSectionItem(
                    title="Lead Qualification & Anti-Spam Screening",
                    description="Ensuring zero fake inquiries reach provider mobile numbers",
                    evidence="MV7 deduplication and intent verification engine",
                    status="ACTIVE",
                ),
                CanvasSectionItem(
                    title="Ground Intelligence Audits",
                    description="Continuous seasonal updates of waterfall timings and road viability",
                    evidence="MV5 freshness monitoring",
                    status="ACTIVE",
                ),
            ],
            key_partners=[
                CanvasSectionItem(
                    title="District Tourism Boards & Forest Dept",
                    description="Permit coordination and national park access validation",
                    evidence="MV4 & MV5 official source bonus",
                    status="ACTIVE",
                ),
                CanvasSectionItem(
                    title="Local Artisan Cooperatives",
                    description="Dhokra bell metal and terracotta sculptors in Bastar and Kondagaon",
                    evidence="MV3 supply onboarding",
                    status="ACTIVE",
                ),
            ],
            cost_structure=[
                CanvasSectionItem(
                    title="Field Researcher Verification",
                    description="On-ground audit and operator interview stipends",
                    evidence="Fixed survey and verification operations",
                    status="CONTROLLED",
                ),
                CanvasSectionItem(
                    title="SMS & WhatsApp Dispatch APIs",
                    description="Real-time inquiry routing costs (₹0.15 per dispatch)",
                    evidence="Direct variable transaction cost",
                    status="MINIMAL",
                ),
            ],
            hypotheses=hypotheses,
        )
