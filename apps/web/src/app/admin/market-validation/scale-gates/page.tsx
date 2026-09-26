"use client";

import React, { useEffect, useState } from "react";
import { ScaleGateCard, ScaleGateItem } from "@/components/market-validation/ScaleGateCard";

export default function ScaleGatesAdminPage() {
  const [gates, setGates] = useState<ScaleGateItem[]>([]);
  const [decision, setDecision] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/market-validation/pilots")
      .then((res) => res.json())
      .then((pilots) => {
        if (Array.isArray(pilots) && pilots.length > 0) {
          const pilotId = pilots[0].id;
          fetch(`/api/v1/market-validation/scale-gates/${pilotId}`)
            .then((r) => r.json())
            .then((data) => setGates(data));

          fetch(`/api/v1/market-validation/scale-gates/${pilotId}/decision`, {
            headers: { "X-User-Role": "SCALE_ADMIN" },
          })
            .then((r) => r.json())
            .then((d) => setDecision(d));
        }
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Scale Gate Governance &amp; Decision Authority
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rule-based scale evaluation preventing uncontrolled rollout without proven economics and safety.
        </p>
      </div>

      <ScaleGateCard
        gates={gates}
        decision={decision?.decision}
        rationale={decision?.rationale}
      />
    </div>
  );
}
