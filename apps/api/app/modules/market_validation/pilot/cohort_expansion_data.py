"""
Cohort Expansion, Monetization Economics & Scale Governance Data (Days 31–90).

Specifications:
- 160 Qualified Traveler Leads across 3 Feeder Markets:
    1. Raipur Urban Cultural Explorers (65 leads)
    2. Nagpur Weekend Eco & Adventure (50 leads)
    3. Hyderabad Heritage & Wilderness Trek (45 leads)
- Pay-Per-Lead Host Economics (₹25 / lead):
    - Gross Revenue: 160 * ₹25 = ₹4,000 INR
    - Lead Delivery Dispatch Costs: ₹56 INR
    - Net Margin: 98.6%
- Host Response SLA:
    - Target: < 4 hours
    - Observed Average: 1.9 hours
    - Compliance Rate: 94.4% (151 / 160 within SLA)
- Retention & Referral:
    - Repeat Planning Intent: 42.5% (Gate 8 threshold >= 40%)
    - Net Promoter Score: +64 NPS
- 10 Scale Gates & Scale Determination:
    - Status: ALL 10 GATES PASSED
    - Determination: SCALE (Authorized for Surguja Ecotourism Circuit Expansion)
"""

FEEDER_MARKET_COHORTS = [
    {
        "id": "cohort-raipur-urban",
        "name": "Raipur Urban Cultural Explorers",
        "origin_market": "Raipur Metro (Capital Hub)",
        "traveler_segment": "URBAN_CULTURAL_EXPLORERS",
        "qualified_leads": 65,
        "avg_party_size": 2.8,
        "conversion_to_booking_pct": 21.5,
        "avg_response_sla_hours": 1.6,
        "sla_compliance_pct": 96.9,
        "primary_destinations": ["Chitrakote Falls", "Tirathgarh Falls", "Kondagaon Craft Village"],
        "popular_experiences": ["Dhokra Metal Casting Trail", "Sunset indravati Boating", "Gondi Village Feast"],
        "referral_intent_pct": 46.2,
    },
    {
        "id": "cohort-nagpur-eco",
        "name": "Nagpur Weekend Eco & Adventure",
        "origin_market": "Nagpur Region (NH53 Highway Corridor)",
        "traveler_segment": "WEEKEND_ECO_ADVENTURE",
        "qualified_leads": 50,
        "avg_party_size": 3.2,
        "conversion_to_booking_pct": 18.0,
        "avg_response_sla_hours": 2.1,
        "sla_compliance_pct": 92.0,
        "primary_destinations": ["Kotumsar Caves", "Kanger Valley National Park", "Tirathgarh Falls"],
        "popular_experiences": ["Speleology Cave Expedition", "Kanger River Kayaking", "Wildlife Birding Trail"],
        "referral_intent_pct": 40.0,
    },
    {
        "id": "cohort-hyderabad-heritage",
        "name": "Hyderabad Heritage & Wilderness Trek",
        "origin_market": "Hyderabad Tech Corridor (NH30 South Access)",
        "traveler_segment": "HERITAGE_WILDERNESS_TREK",
        "qualified_leads": 45,
        "avg_party_size": 2.4,
        "conversion_to_booking_pct": 15.6,
        "avg_response_sla_hours": 2.2,
        "sla_compliance_pct": 93.3,
        "primary_destinations": ["Dholkal Ganesh Peak", "Dantewada Temple", "Chitrakote Falls"],
        "popular_experiences": ["Dholkal High-Altitude Trek", "Bastar Weekly Haat Tour", "Tribal Herbal Medicine Trail"],
        "referral_intent_pct": 37.8,
    },
]

MONETIZATION_ECONOMICS = {
    "pricing_model": "PAY_PER_QUALIFIED_LEAD",
    "fee_per_lead_inr": 25.0,
    "total_qualified_leads": 160,
    "gross_revenue_inr": 4000.0,
    "dispatch_cost_per_lead_inr": 0.35,
    "total_dispatch_cost_inr": 56.0,
    "net_gross_profit_inr": 3944.0,
    "net_contribution_margin_pct": 98.6,
    "host_collection_rate_pct": 96.2,
    "provider_satisfaction_pct": 88.9,
    "blended_ltv_cac_ratio": 8.5,
    "payback_period_days": 14.0,
}

HOST_SLA_METRICS = {
    "target_sla_hours": 4.0,
    "observed_avg_sla_hours": 1.9,
    "total_leads_dispatched": 160,
    "within_sla_count": 151,
    "sla_compliance_pct": 94.4,
    "breached_count": 9,
    "auto_reassigned_count": 4,
    "fastest_response_minutes": 18,
    "slowest_response_hours": 5.2,
}

RETENTION_AND_REFERRAL = {
    "total_travelers_surveyed": 120,
    "repeat_trip_planning_intent_pct": 42.5,
    "gate_8_threshold_pct": 40.0,
    "gate_8_passed": True,
    "net_promoter_score": 64,
    "word_of_mouth_referral_pct": 34.2,
    "secondary_circuit_interest_pct": 78.5,
    "preferred_secondary_circuit": "Surguja Ecotourism (Mainpat & Ramgarh)",
}

SCALE_GATES_EVALUATION = [
    {
        "gate_number": 1,
        "name": "Consumer Demand",
        "metric": "Discovery to Plan Conversion",
        "threshold": ">= 20.0%",
        "observed_value": "24.8%",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 2,
        "name": "Supply Activation",
        "metric": "Active Participating Providers",
        "threshold": ">= 15 Providers",
        "observed_value": "18 Providers (10 Homestays, 8 Guides)",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 3,
        "name": "Transaction Feasibility",
        "metric": "Qualified Lead-to-Booking Conversion",
        "threshold": ">= 15.0%",
        "observed_value": "18.2%",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 4,
        "name": "Unit Economics",
        "metric": "Net Contribution Margin",
        "threshold": "> 10.0%",
        "observed_value": "84.2% Net Blended / 98.6% Lead Margin",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 5,
        "name": "Operational Stability",
        "metric": "Unresolved Incident Rate",
        "threshold": "< 2.0%",
        "observed_value": "0.6%",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 6,
        "name": "Safety Compliance",
        "metric": "Critical Unaddressed Safety Breaches",
        "threshold": "0 Breaches",
        "observed_value": "0 Breaches (100% Resolved / Clean)",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 7,
        "name": "Content Completeness",
        "metric": "Verified Regional Attraction Coverage",
        "threshold": ">= 85.0%",
        "observed_value": "92.0%",
        "status": "PASSED",
        "is_blocker": True,
    },
    {
        "gate_number": 8,
        "name": "Retention Intent",
        "metric": "Trip Cycle Repeat/Recommend Intent",
        "threshold": ">= 40.0%",
        "observed_value": "42.5%",
        "status": "PASSED",
        "is_blocker": False,
    },
    {
        "gate_number": 9,
        "name": "Founder Decoupling",
        "metric": "Manual Founder Operational Workflows",
        "threshold": "< 20.0%",
        "observed_value": "11.7%",
        "status": "PASSED",
        "is_blocker": False,
    },
    {
        "gate_number": 10,
        "name": "Market Transferability",
        "metric": "Surguja Candidate Circuit Affinity Score",
        "threshold": ">= 60.0",
        "observed_value": "74.8 / 100",
        "status": "PASSED",
        "is_blocker": False,
    },
]

SURGUJA_EXPANSION_DOSSIER = {
    "candidate_circuit_id": "surguja-ecotourism-circuit-2",
    "circuit_name": "Surguja Ecotourism & Highland Heritage Circuit",
    "hub_district": "Surguja (Ambikapur Hub)",
    "transferability_score": 74.8,
    "recommendation": "AUTHORIZED_FOR_SECONDARY_EXPANSION",
    "key_destinations": [
        {
            "id": "mainpat-plateau",
            "name": "Mainpat Tibetan Plateau & Tiger Point",
            "type": "HIGHLAND_PLATEAU",
            "role": "PRIMARY_ANCHOR",
            "coordinates": [22.8123, 83.2845],
        },
        {
            "id": "ramgarh-caves",
            "name": "Ramgarh Caves & Sita Bengra Amphitheatre",
            "type": "ANCIENT_THEATRE_CAVES",
            "role": "HERITAGE_SPOKE",
            "coordinates": [22.8833, 82.9167],
        },
        {
            "id": "tatapani-springs",
            "name": "Tatapani Geothermal Hot Springs",
            "type": "GEOTHERMAL_SPRINGS",
            "role": "WELLNESS_WAYPOINT",
            "coordinates": [23.6841, 83.5120],
        },
        {
            "id": "kailash-gufa",
            "name": "Kailash Gufa & Forest Sanctuary",
            "type": "NATURE_SANCTUARY",
            "role": "ECO_TREK",
            "coordinates": [22.7500, 83.1500],
        },
    ],
    "target_supply_certification": {
        "homestays_target": 12,
        "guides_target": 8,
        "emergency_roster_defined": True,
    },
    "scale_readiness_mandate": "Expand platform dispatch to Surguja upon Day 90 review sign-off.",
}
