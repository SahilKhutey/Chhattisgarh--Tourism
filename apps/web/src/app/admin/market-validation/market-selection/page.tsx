"use client";

import React, { useEffect, useState } from "react";
import { MarketSelectionMatrix, MarketCandidateItem } from "@/components/market-validation/MarketSelectionMatrix";

export default function MarketSelectionAdminPage() {
  const [markets, setMarkets] = useState<MarketCandidateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/market-selection")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMarkets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Market Selection &amp; Circuit Prioritization
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-backed ranking justifying Bastar Tribal Heritage as Circuit 1 over Surguja, Bilaspur, and Raipur.
        </p>
      </div>

      <MarketSelectionMatrix markets={markets} />
    </div>
  );
}
