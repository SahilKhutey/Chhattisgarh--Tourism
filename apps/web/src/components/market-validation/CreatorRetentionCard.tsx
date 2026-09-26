import React from "react";

export interface CreatorMetrics {
  totalActiveCreators: number;
  totalContentPieces: number;
  totalViews: number;
  totalTripsInfluenced: number;
  creatorContinuationRate: number;
  avgTripsPerCreator: number;
}

export interface CreatorRetentionCardProps {
  metrics: CreatorMetrics;
}

export function CreatorRetentionCard({
  metrics = {
    totalActiveCreators: 24,
    totalContentPieces: 142,
    totalViews: 68400,
    totalTripsInfluenced: 184,
    creatorContinuationRate: 0.75,
    avgTripsPerCreator: 7.6,
  },
}: CreatorRetentionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Creator Content Engine &amp; Retention</h3>
          <p className="text-xs text-slate-500">
            Regional storytellers and photographers driving organic destination awareness
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          {(metrics.creatorContinuationRate * 100).toFixed(0)}% Retention
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Active Creators</span>
          <span className="text-base font-bold text-slate-900">{metrics.totalActiveCreators}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Stories Published</span>
          <span className="text-base font-bold text-slate-900">{metrics.totalContentPieces}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Views</span>
          <span className="text-base font-bold text-blue-700">{metrics.totalViews.toLocaleString()}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Trips Influenced</span>
          <span className="text-base font-bold text-emerald-700">{metrics.totalTripsInfluenced}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Creators generate an average of <strong className="text-slate-800">{metrics.avgTripsPerCreator} trips</strong> per active participant across Bastar, Surguja, and Sirpur circuits.
      </p>
    </div>
  );
}
