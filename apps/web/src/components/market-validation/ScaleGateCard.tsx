import React from "react";

export interface ScaleGateItem {
  id: string;
  gate_name: string;
  requirement: string;
  metric: string;
  threshold: number;
  actual_value: number;
  status: string;
  blocker: boolean;
}

export interface ScaleGateCardProps {
  gates: ScaleGateItem[];
  decision?: string;
  rationale?: string;
  onUpdateGate?: (gateId: string, actualValue: number, status: string) => void;
}

export function ScaleGateCard({
  gates,
  decision = "SCALE",
  rationale = "All critical gates passed successfully.",
  onUpdateGate,
}: ScaleGateCardProps) {
  const getDecisionBadge = (dec: string) => {
    switch (dec) {
      case "SCALE":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "LIMITED_EXPANSION":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CONTINUE_PILOT":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "PIVOT":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "PAUSE":
      case "STOP":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="scale-gate-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Post-Pilot Scale Gates (10 Standards)</h3>
          <p className="text-xs text-slate-500">
            Defensible thresholds determining scaling authorization vs limited expansion or pivot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Scale Decision:</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDecisionBadge(decision)}`}>
            {decision.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
        <span className="font-bold">Evaluation Rationale: </span>
        {rationale}
      </div>

      <div className="divide-y divide-slate-100">
        {gates.map((g) => (
          <div key={g.id} className="py-2.5 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <span>{g.gate_name.replace(/_/g, " ").toUpperCase()}</span>
                {g.blocker && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 rounded font-bold">
                    Critical Blocker
                  </span>
                )}
              </div>
              <div className="text-slate-500 text-[11px]">{g.requirement}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold text-slate-800">{g.actual_value}</div>
                <div className="text-[10px] text-slate-400">Target: {g.threshold}</div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  g.status === "PASSED"
                    ? "bg-emerald-100 text-emerald-800"
                    : g.status === "FAILED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {g.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
