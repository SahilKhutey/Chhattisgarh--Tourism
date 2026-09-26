"use client";

import React, { useEffect, useState } from "react";
import { WillingnessToPayCard } from "@/components/market-validation/WillingnessToPayCard";

export default function WillingnessToPayAdminPage() {
  const [segment, setSegment] = useState<"PROVIDER" | "CONSUMER">("PROVIDER");
  const [summary, setSummary] = useState<any>(null);
  const [sensitivity, setSensitivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/v1/market-validation/business/willingness-to-pay/summary?participant_type=${segment}`, {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
      fetch(`/api/v1/market-validation/business/willingness-to-pay/sensitivity?participant_type=${segment}`, {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
    ])
      .then(([sumData, sensData]) => {
        setSummary(sumData);
        setSensitivity(sensData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [segment]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Behavioral Economics • MV9
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Willingness to Pay &amp; Price Sensitivity
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical commitment rates, payment attempt verification, and Van Westendorp pricing curves.
          </p>
        </div>

        <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setSegment("PROVIDER")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              segment === "PROVIDER" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Provider Supply
          </button>
          <button
            onClick={() => setSegment("CONSUMER")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              segment === "CONSUMER" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Consumer Demand
          </button>
        </div>
      </div>

      <WillingnessToPayCard
        participantType={segment}
        totalResponses={summary?.total_responses}
        commitmentRate={summary?.commitment_rate}
        conversionRate={summary?.conversion_rate}
        averageAcceptedPrice={summary?.average_accepted_price}
        tooCheapPrice={sensitivity?.too_cheap_price}
        cheapPrice={sensitivity?.cheap_good_value_price}
        expensivePrice={sensitivity?.expensive_price}
        tooExpensivePrice={sensitivity?.too_expensive_price}
        optimalPricePoint={sensitivity?.optimal_price_point}
        indifferencePricePoint={sensitivity?.indifference_price_point}
        recommendation={sensitivity?.recommendation}
      />
    </div>
  );
}
