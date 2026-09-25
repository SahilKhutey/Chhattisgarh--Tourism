import React from "react";
import { PainScore } from "./PainScore";

export interface ConsumerProblemData {
  id: string;
  journey_stage: string;
  problem_statement: string;
  current_behavior: string;
  workaround: string;
  frequency: number;
  severity: number;
  time_cost: number;
  trust_impact: number;
  pain_score: number;
  evidence_strength: string;
  affected_segment?: string | null;
  affected_geography?: string | null;
  related_jtbd?: string | null;
  cluster_tag?: string | null;
  status: string;
}

interface ProblemCardProps {
  problem: ConsumerProblemData;
  onAttachEvidence?: (problemId: string) => void;
}

export function ProblemCard({ problem, onAttachEvidence }: ProblemCardProps) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-400 text-[11px] font-mono uppercase tracking-wide">
              {problem.journey_stage}
            </span>
            {problem.related_jtbd && (
              <span className="px-2 py-0.5 rounded bg-slate-800/80 text-blue-400 text-[11px] font-mono">
                {problem.related_jtbd}
              </span>
            )}
            {problem.cluster_tag && (
              <span className="text-[11px] text-slate-400 font-medium">
                #{problem.cluster_tag}
              </span>
            )}
          </div>
          <PainScore
            score={problem.pain_score}
            frequency={problem.frequency}
            severity={problem.severity}
            timeCost={problem.time_cost}
            trustImpact={problem.trust_impact}
          />
        </div>

        <h3 className="text-base font-semibold text-slate-100 leading-snug mb-3">
          {problem.problem_statement}
        </h3>

        <div className="space-y-2 text-xs">
          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
            <span className="text-slate-400 font-medium block mb-0.5">
              Current Behavior:
            </span>
            <p className="text-slate-300">{problem.current_behavior}</p>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
            <span className="text-amber-400/90 font-medium block mb-0.5">
              Workaround:
            </span>
            <p className="text-slate-300">{problem.workaround}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
        <div>
          <span>Strength: </span>
          <span className="text-slate-200 font-medium">
            {problem.evidence_strength.replace("_", " ")}
          </span>
          {problem.affected_geography && (
            <span className="ml-2 text-slate-400">📍 {problem.affected_geography}</span>
          )}
        </div>

        {onAttachEvidence && (
          <button
            type="button"
            onClick={() => onAttachEvidence(problem.id)}
            className="text-teal-400 hover:text-teal-300 font-medium underline"
          >
            Attach Evidence
          </button>
        )}
      </div>
    </div>
  );
}
