import React from "react";

export interface TrustBreakdownData {
  official_source_bonus: number;
  recent_verification_bonus: number;
  provider_confirmation_bonus: number;
  community_confirmation_bonus: number;
  fresh_media_bonus: number;
  consistent_sources_bonus: number;
  contradiction_penalty: number;
  total_trust_score: number;
}

export interface ContentTrustCardProps {
  trustScore: number;
  sourceCount: number;
  verifiedSources: number;
  freshnessScore: number;
  contradictionCount?: number;
  breakdown?: TrustBreakdownData;
}

export function ContentTrustCard({
  trustScore,
  sourceCount,
  verifiedSources,
  freshnessScore,
  contradictionCount = 0,
  breakdown,
}: ContentTrustCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Provenance & Verification
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">Content Trust Model</h4>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Trust Index</div>
          <div className="text-2xl font-black text-blue-700">{trustScore.toFixed(1)} / 100</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
          ✓ {verifiedSources} Verified Sources
        </span>
        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
          {sourceCount} Total Sources
        </span>
        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold">
          Freshness: {Math.round(freshnessScore)}%
        </span>
        {contradictionCount > 0 && (
          <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 font-bold border border-red-200">
            ⚠ {contradictionCount} Contradiction Conflict
          </span>
        )}
      </div>

      {breakdown && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Official / Gov Source (+30)</span>
            <span className="font-bold text-slate-900">+{breakdown.official_source_bonus}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Recent Verification (+20)</span>
            <span className="font-bold text-slate-900">+{breakdown.recent_verification_bonus}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Provider Confirmation (+15)</span>
            <span className="font-bold text-slate-900">+{breakdown.provider_confirmation_bonus}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Community Confirmation (+15)</span>
            <span className="font-bold text-slate-900">+{breakdown.community_confirmation_bonus}</span>
          </div>
          {breakdown.contradiction_penalty > 0 && (
            <div className="flex justify-between text-red-600 font-bold pt-1 border-t border-slate-200">
              <span>Contradiction Penalty</span>
              <span>-{breakdown.contradiction_penalty}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
