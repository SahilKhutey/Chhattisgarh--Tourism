import React from "react";

export interface PilotData {
  id: string;
  name: string;
  validation_decision_id: string;
  status: string;
  version: number;
  minimum_sample: number;
  target_sample: number;
  budget_band: string;
  launch_owner: string;
  geography_scope?: {
    division?: string;
    districts?: string[];
    tourism_zone?: string;
  };
  product_scope?: {
    in_scope?: string[];
    out_of_scope?: string[];
  };
}

export interface PilotDefinitionProps {
  pilot: PilotData;
  onTransition?: (targetStatus: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

export function PilotDefinition({
  pilot,
  onTransition,
  onPause,
  onResume,
  onComplete,
  isLoading = false,
}: PilotDefinitionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "PAUSED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "APPROVED":
      case "READY":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "FAILED":
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="pilot-definition">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">v{pilot.version}</span>
            <h2 className="text-lg font-bold text-slate-900">{pilot.name}</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusColor(pilot.status)}`}>
              {pilot.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Governing MV10 Authority: <span className="font-semibold text-slate-700">{pilot.validation_decision_id}</span>
          </p>
        </div>

        {/* Operational Lifecycle Controls */}
        <div className="flex items-center gap-2">
          {pilot.status === "ACTIVE" && onPause && (
            <button
              onClick={onPause}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Pause Pilot
            </button>
          )}

          {pilot.status === "PAUSED" && onResume && (
            <button
              onClick={onResume}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Resume Pilot
            </button>
          )}

          {pilot.status === "ACTIVE" && onComplete && (
            <button
              onClick={onComplete}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Complete Pilot
            </button>
          )}

          {pilot.status === "DRAFT" && onTransition && (
            <button
              onClick={() => onTransition("DESIGNED")}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              Mark Designed
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-2">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Division & Zone</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {pilot.geography_scope?.division || "Bastar"}
          </div>
          <div className="text-xs text-slate-500">{pilot.geography_scope?.tourism_zone || "Chitrakote Circuit"}</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Sample Size Target</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {pilot.minimum_sample} min / {pilot.target_sample} target
          </div>
          <div className="text-xs text-slate-500">Verified travelers</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Budget Allocation</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{pilot.budget_band}</div>
          <div className="text-xs text-slate-500">Operational runway</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Launch Owner</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{pilot.launch_owner}</div>
          <div className="text-xs text-slate-500">Execution accountability</div>
        </div>
      </div>
    </div>
  );
}
