import React from "react";

export interface RouteValidationData {
  id?: string;
  origin: string;
  destination: string;
  intermediate_places?: string[];
  estimated_duration_minutes: number;
  travel_mode?: "CAR" | "BIKE" | "BUS" | "TRAIN" | "TREK";
  feasibility: "FEASIBLE" | "DIFFICULT" | "UNREALISTIC";
  evidence?: string | null;
  scenic_score?: number | null;
  road_condition_score?: number | null;
}

export interface RouteExperimentProps {
  route: RouteValidationData;
  onValidate?: (route: RouteValidationData) => void;
  onDelete?: (id: string) => void;
}

export function RouteExperiment({ route, onValidate, onDelete }: RouteExperimentProps) {
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  const getFeasibilityBadge = (feasibility: string) => {
    switch (feasibility) {
      case "FEASIBLE":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "DIFFICULT":
        return "bg-amber-50 text-amber-700 border-amber-300";
      case "UNREALISTIC":
        return "bg-red-50 text-red-700 border-red-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getFeasibilityBadge(
              route.feasibility
            )}`}
          >
            {route.feasibility}
          </span>
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
            {route.travel_mode || "CAR"}
          </span>
        </div>

        <div className="text-sm font-bold text-slate-900">
          Est. Travel Time: {formatDuration(route.estimated_duration_minutes)}
        </div>
      </div>

      {/* Origin -> Stops -> Destination Flow */}
      <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Route Corridor Sequence
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-900">
            {route.origin}
          </span>

          {route.intermediate_places && route.intermediate_places.length > 0 ? (
            route.intermediate_places.map((stop, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-400 font-bold">&rarr;</span>
                <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 rounded text-indigo-800 text-xs">
                  {stop}
                </span>
              </React.Fragment>
            ))
          ) : null}

          <span className="text-slate-400 font-bold">&rarr;</span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded shadow-xs font-bold text-emerald-900">
            {route.destination}
          </span>
        </div>
      </div>

      {route.evidence && (
        <div className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded border border-slate-100">
          <span className="font-semibold text-slate-700">Observed Evidence: </span>
          {route.evidence}
        </div>
      )}

      {(route.scenic_score || route.road_condition_score) && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {route.road_condition_score && (
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">Road Quality: </span>
              <span className="font-bold text-slate-800">{route.road_condition_score} / 5</span>
            </div>
          )}
          {route.scenic_score && (
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">Scenic Rating: </span>
              <span className="font-bold text-slate-800">{route.scenic_score} / 5</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 pt-2">
        {onDelete && route.id && (
          <button
            type="button"
            onClick={() => onDelete(route.id!)}
            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
          >
            Remove
          </button>
        )}
        {onValidate && (
          <button
            type="button"
            onClick={() => onValidate(route)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors"
          >
            Re-Validate Feasibility
          </button>
        )}
      </div>
    </div>
  );
}
