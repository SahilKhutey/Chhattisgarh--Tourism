"use client";

import React, { useEffect, useState } from "react";
import { CreatorRetentionCard, CreatorMetrics } from "@/components/market-validation/CreatorRetentionCard";

export default function CreatorRetentionAdminPage() {
  const [metrics, setMetrics] = useState<CreatorMetrics>({
    totalActiveCreators: 24,
    totalContentPieces: 142,
    totalViews: 68400,
    totalTripsInfluenced: 184,
    creatorContinuationRate: 0.75,
    avgTripsPerCreator: 7.6,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/creators", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.total_active_creators !== undefined) {
          setMetrics({
            totalActiveCreators: data.total_active_creators,
            totalContentPieces: data.total_content_pieces,
            totalViews: data.total_views_generated,
            totalTripsInfluenced: data.total_trips_influenced,
            creatorContinuationRate: data.creator_continuation_rate,
            avgTripsPerCreator: data.average_trips_per_creator,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
          Storyteller Engine • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Creator Retention &amp; Content Influence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Measuring the feedback loop where local creators produce authentic destination stories that inspire new journeys.
        </p>
      </div>

      <CreatorRetentionCard metrics={metrics} />
    </div>
  );
}
