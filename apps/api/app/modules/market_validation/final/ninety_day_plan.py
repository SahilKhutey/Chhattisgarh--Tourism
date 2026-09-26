from __future__ import annotations

from app.modules.market_validation.final.schemas import NinetyDayPlanItem


class NinetyDayPlanService:
    def generate_plan(self) -> list[NinetyDayPlanItem]:
        return [
            NinetyDayPlanItem(
                phase="Days 1–30",
                title="Pilot Lockdown & Operational Readiness",
                objective="Deploy controlled pilot in Bastar circuit with 18 verified hosts, 2 support agents, and WhatsApp lead dispatch.",
                actions=[
                    "Conduct on-ground homestay verification in Chitrakote and Tirathgarh",
                    "Establish emergency doctor/police escalation protocol for licensed tribal guides",
                    "Arm automated circuit breakers (max 500 daily active travelers, 10 open leads/host)",
                    "Finalize bilingual (Hindi/English) GIS attraction profiles",
                ],
                owner="OPERATIONS_LEAD",
                success_metric="100% homestays certified; zero safety incidents.",
            ),
            NinetyDayPlanItem(
                phase="Days 31–60",
                title="Cohort Expansion & Monetization Validation",
                objective="Deliver 150+ qualified traveler leads, testing ₹25 pay-per-lead host economics.",
                actions=[
                    "Launch targeted experiential traveler discovery campaigns in Raipur, Nagpur, and Hyderabad",
                    "Measure inquiry-to-booking conversion on homestays and community kayak guides",
                    "Evaluate host response SLA (< 4 hours target)",
                    "Survey repeat travel intent and referral generation",
                ],
                owner="PRODUCT_LEAD",
                success_metric=">= 75% host lead acceptance; positive contribution margin.",
            ),
            NinetyDayPlanItem(
                phase="Days 61–90",
                title="Scale Evaluation & Regional Expansion Preparation",
                objective="Re-evaluate 10 scale gates to authorize secondary expansion into Surguja Ecotourism circuit.",
                actions=[
                    "Audit 60-day trip-cycle retention and review integrity",
                    "Re-calculate blended LTV/CAC across organic and paid channels",
                    "Verify founder intervention rate remains under 20%",
                    "Present Post-Validation Scale Dossier to Tourism Executive Committee",
                ],
                owner="MARKET_RESEARCH_LEAD",
                success_metric="Scale Gate Scorecard >= 90%; Surguja field onboarding cleared.",
            ),
        ]
