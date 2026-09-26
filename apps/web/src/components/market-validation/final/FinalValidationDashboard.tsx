import React from "react";

export interface FinalValidationDashboardProps {
  decision?: string;
  confidence?: string;
  rationale?: string;
  evidenceCount?: number;
  strongEvidenceCount?: number;
  approvedPilot?: string;
}

export function FinalValidationDashboard({
  decision = "CONDITIONAL_GO",
  confidence = "VERY_HIGH",
  rationale = "Core market validation successfully demonstrated in Bastar Tribal Heritage Circuit. Authorizing controlled operational pilot and 90-day execution plan before statewide scaling.",
  evidenceCount = 184,
  strongEvidenceCount = 142,
  approvedPilot = "Bastar Tribal Heritage & Craft Circuit",
}: FinalValidationDashboardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="final-validation-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Market Validation Release • MV13 Final Authority
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Executive Market Validation Determination</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesized conclusion spanning MV1 (Market Intelligence) through MV12 (Unit Hardening)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Confidence Level</div>
            <div className="text-sm font-extrabold text-slate-800">{confidence}</div>
          </div>
          <span className="text-sm font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {decision.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Final Decision Rationale
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">{rationale}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Evidence Points</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{evidenceCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Across MV1–MV12</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">High/Strong Evidence</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{strongEvidenceCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Level 4–5 Behavioral</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Approved Pilot Scope</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">{approvedPilot}</div>
          <div className="text-[10px] text-slate-500">Circuit 1 Focus</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Scale Strategy</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">Controlled 90-Day</div>
          <div className="text-[10px] text-slate-500">Bastar &rarr; Surguja</div>
        </div>
      </div>
    </div>
  );
}
