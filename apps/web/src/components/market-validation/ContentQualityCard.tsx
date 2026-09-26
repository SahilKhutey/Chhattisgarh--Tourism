import React from "react";

export interface QualityBreakdownData {
  completeness: number;
  accuracy: number;
  freshness: number;
  geographic_context: number;
  practical_utility: number;
  trust: number;
  localization: number;
  total: number;
}

export interface ContentQualityCardProps {
  score: number;
  breakdown?: QualityBreakdownData;
  governanceStatus?: string;
}

export function ContentQualityCard({
  score,
  breakdown,
  governanceStatus = "CONTENT_VERIFIED",
}: ContentQualityCardProps) {
  const getQualityColor = (s: number) => {
    if (s >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (s >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Quality Model • 0–100
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">Content Quality Score</h4>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-md border text-base font-black ${getQualityColor(
              score
            )}`}
          >
            {score.toFixed(1)} / 100
          </span>
          <span className="text-xs px-2 py-0.5 font-mono font-semibold bg-slate-100 text-slate-700 rounded">
            {governanceStatus}
          </span>
        </div>
      </div>

      {breakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Completeness</span>
            <span className="font-bold text-slate-800 text-sm">
              {breakdown.completeness} / 20
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Geographic Fit</span>
            <span className="font-bold text-slate-800 text-sm">
              {breakdown.geographic_context} / 20
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Practical Utility</span>
            <span className="font-bold text-slate-800 text-sm">
              {breakdown.practical_utility} / 20
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Cultural Context</span>
            <span className="font-bold text-slate-800 text-sm">
              {breakdown.accuracy} / 15
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Trust & Provenance</span>
            <span className="font-bold text-slate-800 text-sm">
              {breakdown.trust} / 15
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-slate-500 block mb-0.5">Localization</span>
            <span className="font-bold text-slate-800 text-sm">
              {breakdown.localization} / 10
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
