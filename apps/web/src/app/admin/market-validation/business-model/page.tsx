"use client";

import React, { useEffect, useState } from "react";
import {
  BusinessModelCanvas,
  CanvasItem,
  HypothesisItem,
} from "@/components/market-validation/BusinessModelCanvas";
import { RevenueStreamTable, RevenueStreamRow } from "@/components/market-validation/RevenueStreamTable";

export default function BusinessModelAdminPage() {
  const [segments, setSegments] = useState<CanvasItem[]>([]);
  const [valueProps, setValueProps] = useState<CanvasItem[]>([]);
  const [costs, setCosts] = useState<CanvasItem[]>([]);
  const [hypotheses, setHypotheses] = useState<HypothesisItem[]>([]);
  const [streams, setStreams] = useState<RevenueStreamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/business/canvas", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.customer_segments) setSegments(data.customer_segments);
        if (data.value_propositions) setValueProps(data.value_propositions);
        if (data.cost_structure) setCosts(data.cost_structure);
        if (data.hypotheses) setHypotheses(data.hypotheses);
        if (data.revenue_streams) {
          // If detailed models exist, convert or load streams
          setStreams(data.revenue_streams);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Business Model Validation • MV9
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Business Model Canvas &amp; Value Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive 9-box economic canvas validating sustainable monetization without corrupting open discovery.
        </p>
      </div>

      <BusinessModelCanvas
        customerSegments={segments.length > 0 ? segments : undefined}
        valuePropositions={valueProps.length > 0 ? valueProps : undefined}
        costStructure={costs.length > 0 ? costs : undefined}
        hypotheses={hypotheses}
      />

      <RevenueStreamTable streams={streams.length > 0 ? streams : undefined} />
    </div>
  );
}
