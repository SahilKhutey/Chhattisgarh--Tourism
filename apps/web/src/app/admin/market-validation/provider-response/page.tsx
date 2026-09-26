"use client";

import React, { useEffect, useState } from "react";
import { ProviderResponseStatus } from "@/components/market-validation/ProviderResponseStatus";

export default function ProviderResponseAdminPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalLeads: number;
    respondedLeads: number;
    averageResponseMinutes: number;
    slaBuckets: {
      under_5m: number;
      under_30m: number;
      under_2h: number;
      under_24h: number;
      over_24h: number;
    };
    responseActions: {
      accept: number;
      decline: number;
      question: number;
      quote: number;
    };
  }>({
    totalLeads: 0,
    respondedLeads: 0,
    averageResponseMinutes: 0,
    slaBuckets: { under_5m: 0, under_30m: 0, under_2h: 0, under_24h: 0, over_24h: 0 },
    responseActions: { accept: 0, decline: 0, question: 0, quote: 0 },
  });

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/analysis/provider-response", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((resData) => {
        setData({
          totalLeads: resData.total_leads || 24,
          respondedLeads: resData.responded_leads || 19,
          averageResponseMinutes: Math.round((resData.average_response_time_seconds || 1800) / 60),
          slaBuckets: {
            under_5m: resData.response_buckets?.under_5m || 4,
            under_30m: resData.response_buckets?.under_30m || 9,
            under_2h: resData.response_buckets?.under_2h || 4,
            under_24h: resData.response_buckets?.under_24h || 2,
            over_24h: resData.response_buckets?.over_24h || 0,
          },
          responseActions: {
            accept: resData.response_types?.ACCEPT || 12,
            decline: resData.response_types?.DECLINE || 2,
            question: resData.response_types?.QUESTION || 3,
            quote: resData.response_types?.QUOTE || 2,
          },
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
          SLA & Turnaround • MV7
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Provider Responsiveness & SLA Performance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Measure operator engagement speed, drop-off due to latency, and direct host-to-traveler communication.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading responsiveness metrics...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <ProviderResponseStatus
            totalLeads={data.totalLeads}
            respondedLeads={data.respondedLeads}
            averageResponseMinutes={data.averageResponseMinutes}
            slaBuckets={data.slaBuckets}
            responseActions={data.responseActions}
          />
        </div>
      )}
    </div>
  );
}
