import React from "react";

interface ValidationScoreProps {
  status: string;
  confidenceScore?: number;
  supportingCount?: number;
  totalEvaluated?: number;
}

export function ValidationScore({
  status,
  confidenceScore,
  supportingCount,
  totalEvaluated,
}: ValidationScoreProps) {
  const getStyle = (st: string) => {
    switch (st) {
      case "STRONGLY_SUPPORTED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "SUPPORTED":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      case "EMERGING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "INCONCLUSIVE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "INVALIDATED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${getStyle(
          status
        )}`}
      >
        {status.replace("_", " ")}
      </span>

      {confidenceScore !== undefined && (
        <span className="text-xs text-slate-400">
          Confidence: <strong className="text-slate-200">{confidenceScore}</strong>
          {totalEvaluated !== undefined && totalEvaluated > 0 && (
            <span className="text-slate-500 ml-1">
              ({supportingCount ?? 0}/{totalEvaluated})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
