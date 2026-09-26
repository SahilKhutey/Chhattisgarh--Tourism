import React from "react";

export interface TransactionValueMetrics {
  totalGtvFacilitated: number;
  completedTransactionsCount: number;
  averageTransactionValue: number;
  providerValueScore: number; // 0-100
  topDestinationGtv?: string;
  repeatTravelerRate?: number;
  averageSatisfaction?: number; // 1-5
}

export interface TransactionValueCardProps {
  metrics: TransactionValueMetrics;
}

export function TransactionValueCard({
  metrics = {
    totalGtvFacilitated: 486500,
    completedTransactionsCount: 114,
    averageTransactionValue: 4267,
    providerValueScore: 84.5,
    topDestinationGtv: "Bastar & Chitrakote",
    repeatTravelerRate: 18.4,
    averageSatisfaction: 4.8,
  },
}: TransactionValueCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
            Economic Impact Validation
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Gross Tourism Value Facilitated</h3>
        </div>
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl px-3 py-1.5 text-right">
          <span className="text-[10px] text-blue-300 block uppercase font-medium">Provider Score</span>
          <span className="text-lg font-bold text-blue-400">{metrics.providerValueScore.toFixed(1)}/100</span>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          ₹{metrics.totalGtvFacilitated.toLocaleString("en-IN")}
        </span>
        <p className="text-xs text-slate-400 mt-1">
          Direct local economy value delivered to homestays, rural guides, and craft artisans
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <span className="text-[11px] text-slate-400 block font-medium">Completed Bookings</span>
          <p className="text-lg font-bold text-white mt-0.5">{metrics.completedTransactionsCount}</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <span className="text-[11px] text-slate-400 block font-medium">Avg Transaction</span>
          <p className="text-lg font-bold text-white mt-0.5">₹{Math.round(metrics.averageTransactionValue).toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <span className="text-[11px] text-slate-400 block font-medium">Satisfaction</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">★ {metrics.averageSatisfaction?.toFixed(1) || "4.8"}/5.0</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <span className="text-[11px] text-slate-400 block font-medium">Top Zone</span>
          <p className="text-sm font-semibold text-slate-200 mt-1 truncate">{metrics.topDestinationGtv || "Bastar"}</p>
        </div>
      </div>
    </div>
  );
}
