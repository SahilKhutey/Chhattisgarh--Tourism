"use client";

import React, { useEffect, useState } from "react";
import { FinalValidationDashboard } from "@/components/market-validation/final/FinalValidationDashboard";
import { NinetyDayPlan } from "@/components/market-validation/final/NinetyDayPlan";

export default function FinalMarketValidationAdminPage() {
  const [decision, setDecision] = useState<any>(null);
  const [plan, setPlan] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/market-validation/final")
      .then((r) => r.json())
      .then((d) => setDecision(d));

    fetch("/api/v1/market-validation/final/90-day-plan")
      .then((r) => r.json())
      .then((p) => setPlan(p));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Final Release • MV13 Market Validation Authority
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Market Validation Master Release &amp; Determination
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Final synthesis of consumer demand, supply economics, geographic routing, and pilot execution into a defensible scaling mandate.
        </p>
      </div>

      <FinalValidationDashboard
        decision={decision?.decision}
        confidence={decision?.confidence}
        rationale={decision?.rationale}
        approvedPilot={decision?.recommendation_scope?.approved_pilot}
      />

      <NinetyDayPlan plan={plan.length > 0 ? plan : undefined} />
    </div>
  );
}
