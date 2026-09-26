"use client";

import React, { useEffect, useState } from "react";
import { ConversionFunnel, FunnelStage } from "@/components/market-validation/ConversionFunnel";

export default function ConversionAdminPage() {
  const [loading, setLoading] = useState(true);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [overallRate, setOverallRate] = useState<number>(3.2);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/analysis/conversion", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.stages && Array.isArray(data.stages)) {
          setFunnelStages(data.stages);
          setOverallRate(data.overall_conversion_rate || 3.2);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Funnel Economics • MV7
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Conversion Funnel & Channel Attribution
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Analyze drop-offs from destination awareness to completed experiential travel across Bastar, Surguja, and Central zones.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading conversion funnel...</div>
      ) : (
        <ConversionFunnel
          stages={funnelStages.length > 0 ? funnelStages : undefined}
          overallConversionRate={overallRate}
        />
      )}
    </div>
  );
}
