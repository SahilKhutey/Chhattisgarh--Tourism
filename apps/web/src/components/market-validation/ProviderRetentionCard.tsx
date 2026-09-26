import React from "react";

export interface ProviderRetentionMetrics {
  totalOnboarded: number;
  activeProviders: number;
  continuationRate: number;
  reactivatedCount: number;
  avgListingUpdates: number;
  statusDistribution?: Record<string, number>;
}

export interface ProviderRetentionCardProps {
  metrics: ProviderRetentionMetrics;
}

export function ProviderRetentionCard({
  metrics = {
    totalOnboarded: 48,
    activeProviders: 40,
    continuationRate: 0.833,
    reactivatedCount: 6,
    avgListingUpdates: 3.4,
    statusDistribution: {
      CONTINUOUS: 32,
      REACTIVATED: 6,
      OCCASIONAL: 6,
      AT_RISK: 3,
      CHURNED: 1,
    },
  },
}: ProviderRetentionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Provider Continuation &amp; Reactivation</h3>
          <p className="text-xs text-slate-500">
            Supply-side retention: homestay operators maintaining listings &amp; accepting recurring leads
          </p>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {(metrics.continuationRate * 100).toFixed(1)}% Active Continuation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Hosts</span>
          <span className="text-base font-bold text-slate-900">{metrics.totalOnboarded}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Active &amp; Responding</span>
          <span className="text-base font-bold text-emerald-700">{metrics.activeProviders}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Reactivated After 30d</span>
          <span className="text-base font-bold text-purple-700">{metrics.reactivatedCount}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Avg Listing Updates</span>
          <span className="text-base font-bold text-blue-700">{metrics.avgListingUpdates}/host</span>
        </div>
      </div>

      {metrics.statusDistribution && (
        <div className="border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-2">
            Status Breakdown
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(metrics.statusDistribution).map(([st, count]) => (
              <span key={st} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                {st}: <strong className="text-slate-900">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
