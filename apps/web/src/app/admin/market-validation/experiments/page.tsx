"use client";

import React, { useEffect, useState } from "react";
import { BusinessExperimentCard } from "@/components/market-validation/BusinessExperimentCard";
import { PricingExperiment } from "@/components/market-validation/PricingExperiment";

export default function BusinessExperimentsAdminPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Hypothesis Testing • MV9
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Business &amp; Monetization Experiments
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous A/B variant observations testing lead fee elasticity, subscription acceptance, and commission performance.
        </p>
      </div>

      <BusinessExperimentCard />

      <PricingExperiment />
    </div>
  );
}
