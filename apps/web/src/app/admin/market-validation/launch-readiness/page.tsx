"use client";

import React, { useEffect, useState } from "react";
import { LaunchReadinessScorecard } from "@/components/market-validation/LaunchReadinessScorecard";

export default function LaunchReadinessAdminPage() {
  const [readiness, setReadiness] = useState<any>(null);

  useEffect(() => {
    // Fetch default pilot first
    fetch("/api/v1/market-validation/pilots")
      .then((res) => res.json())
      .then((pilots) => {
        if (Array.isArray(pilots) && pilots.length > 0) {
          return fetch(`/api/v1/market-validation/readiness/${pilots[0].id}`);
        }
        return null;
      })
      .then((res) => (res ? res.json() : null))
      .then((data) => {
        if (data) setReadiness(data);
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Launch Readiness Scorecard (12 Gates)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pre-flight gating across product, content, supply, analytics, security, privacy, and emergency safety.
        </p>
      </div>

      <LaunchReadinessScorecard
        productReady={readiness?.product_ready}
        contentReady={readiness?.content_ready}
        geographyReady={readiness?.geography_ready}
        supplyReady={readiness?.supply_ready}
        consumerReady={readiness?.consumer_ready}
        transactionReady={readiness?.transaction_ready}
        analyticsReady={readiness?.analytics_ready}
        supportReady={readiness?.support_ready}
        securityReady={readiness?.security_ready}
        privacyReady={readiness?.privacy_ready}
        safetyReady={readiness?.safety_ready}
        operationalReady={readiness?.operational_ready}
        readinessPercentage={readiness?.readiness_percentage ?? 100}
        overallStatus={readiness?.overall_status ?? "READY"}
        blockers={readiness?.blockers ?? []}
        warnings={readiness?.warnings ?? []}
      />
    </div>
  );
}
