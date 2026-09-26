"use client";

import React, { useEffect, useState } from "react";
import { ProviderRetentionCard, ProviderRetentionMetrics } from "@/components/market-validation/ProviderRetentionCard";

export default function ProviderRetentionAdminPage() {
  const [metrics, setMetrics] = useState<ProviderRetentionMetrics>({
    totalOnboarded: 48,
    activeProviders: 40,
    continuationRate: 0.833,
    reactivatedCount: 6,
    avgListingUpdates: 3.4,
    statusDistribution: {
      CONTINUOUS: 32,
      REACTIVATED: 6,
      OCCASIONAL: 6,
      AT_RISK: 3,
      CHURNED: 1,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/providers", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.total_providers_onboarded !== undefined) {
          setMetrics({
            totalOnboarded: data.total_providers_onboarded,
            activeProviders: data.active_providers_count,
            continuationRate: data.continuation_rate,
            reactivatedCount: data.reactivated_providers_count,
            avgListingUpdates: data.average_listing_updates_per_provider,
            statusDistribution: data.status_distribution,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
          Supply Retention • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Provider Continuation &amp; Reactivation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evaluating ongoing operator participation, listing freshness, and reactivation cycles across Bastar and Surguja.
        </p>
      </div>

      <ProviderRetentionCard metrics={metrics} />
    </div>
  );
}
