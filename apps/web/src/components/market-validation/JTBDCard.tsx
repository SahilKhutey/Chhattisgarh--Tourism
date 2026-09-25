import React from "react";
import { ValidationScore } from "./ValidationScore";

export interface JTBDData {
  id: string;
  jtbd_key: string;
  title: string;
  description: string;
  status: string;
  total_interviews_evaluated: number;
  supporting_interviews_count: number;
  direct_behavior_count: number;
  confidence_score: number;
  evidence_summary?: string | null;
}

interface JTBDCardProps {
  jtbd: JTBDData;
  onSupport?: (jtbd: JTBDData) => void;
  onInvalidate?: (jtbd: JTBDData) => void;
}

export function JTBDCard({ jtbd, onSupport, onInvalidate }: JTBDCardProps) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold">
            {jtbd.jtbd_key}
          </span>
          <ValidationScore
            status={jtbd.status}
            confidenceScore={jtbd.confidence_score}
            supportingCount={jtbd.supporting_interviews_count}
            totalEvaluated={jtbd.total_interviews_evaluated}
          />
        </div>

        <h3 className="text-base font-semibold text-slate-100 mb-1.5">{jtbd.title}</h3>
        <p className="text-sm text-slate-300 italic mb-3">"{jtbd.description}"</p>

        {jtbd.evidence_summary && (
          <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <strong className="text-slate-300 block mb-0.5">Evidence Summary:</strong>
            {jtbd.evidence_summary}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
        <div className="text-slate-400">
          <span>Observed Direct Behaviors: </span>
          <strong className="text-teal-400">{jtbd.direct_behavior_count}</strong>
        </div>

        <div className="flex items-center gap-2">
          {onSupport && (
            <button
              type="button"
              onClick={() => onSupport(jtbd)}
              className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium transition-all"
            >
              Support
            </button>
          )}
          {onInvalidate && (
            <button
              type="button"
              onClick={() => onInvalidate(jtbd)}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-all"
            >
              Invalidate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
