import React from "react";

export interface EvidenceData {
  id: string;
  evidence_type: string;
  observation: string;
  source: string;
  timestamp?: string;
  researcher_confidence: number;
  jtbd_id?: string | null;
  problem_id?: string | null;
}

interface EvidenceCardProps {
  evidence: EvidenceData;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const getBadgeStyle = (tier: string) => {
    switch (tier) {
      case "DIRECT_BEHAVIOR":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "OBSERVED_WORKAROUND":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      case "REPORTED_PAIN":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "USER_STATEMENT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeStyle(
              evidence.evidence_type
            )}`}
          >
            {evidence.evidence_type.replace("_", " ")}
          </span>

          {evidence.jtbd_id && (
            <span className="text-xs font-mono text-blue-400 bg-slate-800 px-2 py-0.5 rounded">
              {evidence.jtbd_id}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          {evidence.observation}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
        <span className="truncate max-w-[200px]" title={evidence.source}>
          Source: <strong className="text-slate-300">{evidence.source}</strong>
        </span>
        <span>
          Confidence:{" "}
          <strong className="text-teal-400">
            {evidence.researcher_confidence}/5
          </strong>
        </span>
      </div>
    </div>
  );
}
