import React from "react";

interface PainScoreProps {
  score: number;
  frequency?: number;
  severity?: number;
  timeCost?: number;
  trustImpact?: number;
  showBreakdown?: boolean;
}

export function PainScore({
  score,
  frequency,
  severity,
  timeCost,
  trustImpact,
  showBreakdown = true,
}: PainScoreProps) {
  const getBadgeStyle = (val: number) => {
    if (val >= 240) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/30 ring-rose-500/20";
    }
    if (val >= 100) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30 ring-amber-500/20";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  const getTierLabel = (val: number) => {
    if (val >= 240) return "Tier 1: High Urgency";
    if (val >= 100) return "Tier 2: Moderate Friction";
    return "Tier 3: Low Priority";
  };

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <div
        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold tracking-wide flex items-center gap-1.5 ${getBadgeStyle(
          score
        )}`}
      >
        <span>Pain: {score}</span>
        <span className="opacity-60 text-[10px] font-normal">
          ({getTierLabel(score)})
        </span>
      </div>

      {showBreakdown && frequency !== undefined && (
        <span className="text-[10px] text-slate-400">
          F:{frequency} × S:{severity} × T:{timeCost} × Tr:{trustImpact}
        </span>
      )}
    </div>
  );
}
