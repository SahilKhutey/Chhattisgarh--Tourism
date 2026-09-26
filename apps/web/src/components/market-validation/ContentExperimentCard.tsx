import React from "react";

export interface ContentExperimentData {
  id: string;
  experiment_key: string;
  name: string;
  hypothesis_key: string;
  content_entry_id?: string | null;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "INVALIDATED";
  control_version: Record<string, any>;
  variant_version: Record<string, any>;
  audience: string;
  primary_metric: string;
  control_metric_value: number;
  variant_metric_value: number;
  sample_size_control: number;
  sample_size_variant: number;
  lift_percentage?: number;
  outcome?: string | null;
}

export interface ContentExperimentCardProps {
  experiment: ContentExperimentData;
  onAssignUser?: (experimentId: string) => void;
  onEdit?: (exp: ContentExperimentData) => void;
}

export function ContentExperimentCard({
  experiment,
  onAssignUser,
  onEdit,
}: ContentExperimentCardProps) {
  const lift =
    experiment.lift_percentage !== undefined
      ? experiment.lift_percentage
      : experiment.control_metric_value > 0
      ? Math.round(
          ((experiment.variant_metric_value - experiment.control_metric_value) /
            experiment.control_metric_value) *
            10000
        ) / 100
      : 0;

  const isPositiveLift = lift > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PAUSED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "INVALIDATED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
              {experiment.experiment_key}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold">
              {experiment.hypothesis_key}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                experiment.status
              )}`}
            >
              {experiment.status}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 mt-1">{experiment.name}</h4>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Observed Lift</div>
          <div
            className={`text-xl font-black ${
              isPositiveLift ? "text-emerald-600" : "text-slate-600"
            }`}
          >
            {isPositiveLift ? `+${lift}%` : `${lift}%`}
          </div>
        </div>
      </div>

      {/* Control vs Variant comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Control (A) - Baseline
          </div>
          <pre className="text-xs text-slate-700 font-mono bg-white p-2 rounded border border-slate-200 overflow-x-auto max-h-24">
            {JSON.stringify(experiment.control_version, null, 2)}
          </pre>
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500">Sample: N={experiment.sample_size_control}</span>
            <span className="font-bold text-slate-800">
              {experiment.primary_metric}: {experiment.control_metric_value}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/80 rounded-md">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            Variant (B) - Structured / Geo Context
          </div>
          <pre className="text-xs text-slate-700 font-mono bg-white p-2 rounded border border-emerald-200 overflow-x-auto max-h-24">
            {JSON.stringify(experiment.variant_version, null, 2)}
          </pre>
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-emerald-200/60 text-xs">
            <span className="text-slate-500">Sample: N={experiment.sample_size_variant}</span>
            <span className="font-bold text-emerald-800">
              {experiment.primary_metric}: {experiment.variant_metric_value}
            </span>
          </div>
        </div>
      </div>

      {experiment.outcome && (
        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-md flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-900">Outcome Evaluation:</span>
          <span className="font-mono text-blue-800 font-bold">{experiment.outcome}</span>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 pt-1">
        {onAssignUser && (
          <button
            type="button"
            onClick={() => onAssignUser(experiment.id)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Test Assignment
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(experiment)}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
          >
            Update Metrics
          </button>
        )}
      </div>
    </div>
  );
}
