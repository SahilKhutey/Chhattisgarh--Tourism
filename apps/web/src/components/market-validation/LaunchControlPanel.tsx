import React from "react";

export interface LaunchControlItem {
  id: string;
  control_type: string;
  name: string;
  enabled: boolean;
  threshold: number;
  current_value: number;
  action: string;
  owner: string;
  triggered: boolean;
}

export interface LaunchControlPanelProps {
  controls: LaunchControlItem[];
  onToggleControl?: (controlId: string, enabled: boolean) => void;
}

export function LaunchControlPanel({
  controls,
  onToggleControl,
}: LaunchControlPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="launch-control-panel">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Launch Controls & Circuit Breakers</h3>
          <p className="text-xs text-slate-500">
            Real-time automated safeguards protecting traveler safety, host SLA, and platform load
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          {controls.filter((c) => c.enabled).length} Active Breakers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {controls.map((ctrl) => (
          <div
            key={ctrl.id}
            className={`p-4 rounded-lg border text-xs transition-all ${
              ctrl.triggered
                ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                : "bg-slate-50/70 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">{ctrl.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ctrl.triggered
                    ? "bg-rose-600 text-white"
                    : ctrl.enabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {ctrl.triggered ? "TRIGGERED" : ctrl.enabled ? "ARMED" : "DISABLED"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 mt-2 mb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Current Load: </span>
                <span className="font-bold text-slate-800">{ctrl.current_value}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Limit Threshold: </span>
                <span className="font-bold text-slate-800">{ctrl.threshold}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 uppercase">Breaker Action: </span>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                  {ctrl.action}
                </span>
              </div>
            </div>

            {onToggleControl && (
              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <button
                  onClick={() => onToggleControl(ctrl.id, !ctrl.enabled)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                    ctrl.enabled
                      ? "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                      : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  {ctrl.enabled ? "Disarm Breaker" : "Arm Breaker"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
