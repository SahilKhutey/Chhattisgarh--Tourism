"use client";

import React, { useEffect, useState } from "react";
import { PricingExperiment } from "@/components/market-validation/PricingExperiment";
import { ProviderPricingCard } from "@/components/market-validation/ProviderPricingCard";

export default function PricingAdminPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Pricing Optimization • MV9
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Pricing Architecture &amp; Price Elasticity
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Validating price tolerance curves (₹10 vs ₹25 vs ₹50) and establishing sustainable provider lead tiers.
        </p>
      </div>

      <PricingExperiment />

      <ProviderPricingCard />
    </div>
  );
}
