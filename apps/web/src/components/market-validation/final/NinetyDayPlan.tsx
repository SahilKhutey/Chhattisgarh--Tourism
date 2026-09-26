import React from "react";

export interface NinetyDayPlanItem {
  phase: string;
  title: string;
  objective: string;
  actions: string[];
  owner: string;
  success_metric: string;
}

export interface NinetyDayPlanProps {
  plan?: NinetyDayPlanItem[];
}

export function NinetyDayPlan({
  plan = [
    {
      phase: "Days 1–30",
      title: "Pilot Lockdown & Operational Readiness",
      objective: "Deploy controlled pilot in Bastar circuit with 18 verified hosts, 2 support agents, and WhatsApp lead dispatch.",
      actions: [
        "Conduct on-ground homestay verification in Chitrakote and Tirathgarh",
        "Establish emergency escalation protocol for licensed tribal guides",
        "Arm automated circuit breakers (max 500 daily active travelers)",
      ],
      owner: "OPERATIONS_LEAD",
      success_metric: "100% homestays certified; zero safety incidents.",
    },
    {
      phase: "Days 31–60",
      title: "Cohort Expansion & Monetization Validation",
      objective: "Deliver 150+ qualified traveler leads, testing ₹25 pay-per-lead host economics.",
      actions: [
        "Launch targeted experiential traveler discovery campaigns in Raipur & Nagpur",
        "Measure inquiry-to-booking conversion on homestays and community kayak guides",
        "Evaluate host response SLA (< 4 hours target)",
      ],
      owner: "PRODUCT_LEAD",
      success_metric: ">= 75% host lead acceptance; positive contribution margin.",
    },
    {
      phase: "Days 61–90",
      title: "Scale Evaluation & Regional Expansion Preparation",
      objective: "Re-evaluate 10 scale gates to authorize secondary expansion into Surguja Ecotourism circuit.",
      actions: [
        "Audit 60-day trip-cycle retention and review integrity",
        "Re-calculate blended LTV/CAC across channels",
        "Present Post-Validation Scale Dossier to Tourism Executive Committee",
      ],
      owner: "MARKET_RESEARCH_LEAD",
      success_metric: "Scale Gate Scorecard >= 90%; Surguja field onboarding cleared.",
    },
  ],
}: NinetyDayPlanProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="ninety-day-plan">
      <div className="pb-3 border-b border-slate-100 mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Post-Validation 90-Day Execution Roadmap</h3>
        <p className="text-xs text-slate-500">
          Structured execution plan transitioning from single-circuit validation into regional scale
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plan.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between text-xs">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {item.phase}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-2">{item.title}</h4>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{item.objective}</p>

              <div className="mt-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Key Actions
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px]">
                  {item.actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
              <div>Owner: <span className="font-semibold text-slate-700">{item.owner}</span></div>
              <div className="text-emerald-700 font-medium mt-0.5">Target: {item.success_metric}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
