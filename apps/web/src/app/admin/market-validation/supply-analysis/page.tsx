"use client";

import React, { useEffect, useState } from "react";
import { SupplyDashboard, FunnelStats } from "@/components/market-validation/SupplyDashboard";

export default function SupplyAnalysisPage() {
  const [funnel, setFunnel] = useState<FunnelStats | null>(null);
  const [valueData, setValueData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/market-validation/analysis/provider-funnel", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((res) => res.json()),
      fetch("/api/v1/market-validation/analysis/provider-value", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((res) => res.json()),
      fetch("/api/v1/market-validation/analysis/provider-response", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((res) => res.json()),
    ])
      .then(([fData, vData, rData]) => {
        setFunnel(fData);
        setValueData(vData);
        setResponseData(rData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Supply Economics • MV3
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Supply-Side Marketplace Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Holistic analysis of onboarding completion, provider response velocity, lead qualification, and economic value delivered.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Computing supply metrics...</div>
      ) : funnel ? (
        <div className="space-y-6">
          <SupplyDashboard
            funnel={funnel}
            totalRevenue={valueData?.total_estimated_revenue || 0}
            avgResponseMins={Math.round((responseData?.avg_response_time_seconds || 0) / 60)}
          />

          {responseData?.response_buckets && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-100 mb-4">Response Time Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-xl font-bold text-emerald-400">{responseData.response_buckets.under_1h || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">&lt; 1 hour</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-xl font-bold text-teal-400">{responseData.response_buckets["1h_to_4h"] || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">1 - 4 hours</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-xl font-bold text-indigo-400">{responseData.response_buckets["4h_to_24h"] || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">4 - 24 hours</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-xl font-bold text-amber-400">{responseData.response_buckets.over_24h || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">&gt; 24 hours</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-xl font-bold text-rose-400">{responseData.response_buckets.no_response || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">No Response</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No supply data available yet.
        </div>
      )}
    </div>
  );
}
