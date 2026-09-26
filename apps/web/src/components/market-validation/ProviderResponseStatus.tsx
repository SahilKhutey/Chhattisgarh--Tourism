import React from "react";

export interface ProviderResponseStatusProps {
  totalLeads: number;
  respondedLeads: number;
  averageResponseMinutes?: number;
  slaBuckets?: {
    under_5m: number;
    under_30m: number;
    under_2h: number;
    under_24h: number;
    over_24h: number;
  };
  responseActions?: {
    accept: number;
    decline: number;
    question: number;
    quote: number;
  };
}

export function ProviderResponseStatus({
  totalLeads,
  respondedLeads,
  averageResponseMinutes = 45,
  slaBuckets = {
    under_5m: 5,
    under_30m: 12,
    under_2h: 8,
    under_24h: 3,
    over_24h: 1,
  },
  responseActions = {
    accept: 18,
    decline: 2,
    question: 6,
    quote: 3,
  },
}: ProviderResponseStatusProps) {
  const responseRate = totalLeads > 0 ? Math.round((respondedLeads / totalLeads) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Provider Responsiveness & SLA</h3>
          <p className="text-xs text-slate-500">Validation of supply-side attention and lead turnaround</p>
        </div>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          {responseRate}% Response Rate
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-500 font-medium">Total Inquiries</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{totalLeads}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-500 font-medium">Responded</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{respondedLeads}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-500 font-medium">Avg Response</span>
          <p className="text-xl font-bold text-blue-700 mt-0.5">{averageResponseMinutes} min</p>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
          Turnaround Distribution (SLA)
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium">⚡ &lt; 5 mins (Instant)</span>
            <span className="font-semibold text-slate-700">{slaBuckets.under_5m}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-medium">🚀 5 - 30 mins (Fast)</span>
            <span className="font-semibold text-slate-700">{slaBuckets.under_30m}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-600 font-medium">🕒 30m - 2h (Standard)</span>
            <span className="font-semibold text-slate-700">{slaBuckets.under_2h}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-600 font-medium">⌛ 2h - 24h (Delayed)</span>
            <span className="font-semibold text-slate-700">{slaBuckets.under_24h}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-rose-600 font-medium">⚠️ &gt; 24h (SLA Breach)</span>
            <span className="font-semibold text-slate-700">{slaBuckets.over_24h}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
          Response Action Breakdown
        </span>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-emerald-50 text-emerald-800">
            <p className="font-bold">{responseActions.accept}</p>
            <p className="text-[10px] mt-0.5">Accept</p>
          </div>
          <div className="p-2 rounded bg-rose-50 text-rose-800">
            <p className="font-bold">{responseActions.decline}</p>
            <p className="text-[10px] mt-0.5">Decline</p>
          </div>
          <div className="p-2 rounded bg-indigo-50 text-indigo-800">
            <p className="font-bold">{responseActions.question}</p>
            <p className="text-[10px] mt-0.5">Question</p>
          </div>
          <div className="p-2 rounded bg-amber-50 text-amber-800">
            <p className="font-bold">{responseActions.quote}</p>
            <p className="text-[10px] mt-0.5">Quote</p>
          </div>
        </div>
      </div>
    </div>
  );
}
