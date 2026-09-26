import React from "react";

export interface FailureReasonItem {
  cause: string;
  count: number;
  percentage: number;
}

export interface SeasonalityItem {
  season_name: string;
  cohort_count: number;
  trip_cycle_retention_rate: number;
  next_trip_rate: number;
  seasonality_adjustment_factor: number;
}

export interface RetentionInsightsProps {
  failures?: FailureReasonItem[];
  seasonality?: SeasonalityItem[];
  retentionDecision?: string;
}

const DEFAULT_FAILURES: FailureReasonItem[] = [
  { cause: "USER_COMPLETED_NEED", count: 42, percentage: 35.0 },
  { cause: "SEASONALITY", count: 28, percentage: 23.3 },
  { cause: "NO_RELEVANT_DESTINATION", count: 18, percentage: 15.0 },
  { cause: "CONTENT_GAP", count: 12, percentage: 10.0 },
  { cause: "LOW_REGIONAL_COVERAGE", count: 11, percentage: 9.2 },
  { cause: "BOOKING_FAILURE", count: 5, percentage: 4.2 },
];

const DEFAULT_SEASONALITY: SeasonalityItem[] = [
  { season_name: "Dussehra Festival", cohort_count: 320, trip_cycle_retention_rate: 0.34, next_trip_rate: 0.28, seasonality_adjustment_factor: 1.25 },
  { season_name: "Winter Peak (Nov-Feb)", cohort_count: 480, trip_cycle_retention_rate: 0.29, next_trip_rate: 0.24, seasonality_adjustment_factor: 1.15 },
  { season_name: "Monsoon (Jul-Sep)", cohort_count: 210, trip_cycle_retention_rate: 0.22, next_trip_rate: 0.17, seasonality_adjustment_factor: 0.90 },
  { season_name: "Summer (Apr-Jun)", cohort_count: 140, trip_cycle_retention_rate: 0.14, next_trip_rate: 0.11, seasonality_adjustment_factor: 0.75 },
];

export function RetentionInsights({
  failures = DEFAULT_FAILURES,
  seasonality = DEFAULT_SEASONALITY,
  retentionDecision = "SUPPORTED",
}: RetentionInsightsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Seasonality Adjusted Cohort Dynamics</h3>
            <p className="text-xs text-slate-500">
              Controlling for regional festival and weather cycles across Chhattisgarh travel seasons
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Decision: {retentionDecision}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {seasonality.map((s) => (
            <div key={s.season_name} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-xs font-semibold text-slate-800 block">{s.season_name}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.cohort_count} Travelers</p>
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs">
                <span className="text-slate-600">Trip-Cycle:</span>
                <strong className="text-emerald-700">{(s.trip_cycle_retention_rate * 100).toFixed(0)}%</strong>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-600">Index Factor:</span>
                <span className="font-mono text-slate-700">{s.seasonality_adjustment_factor.toFixed(2)}x</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-sm mb-1">Retention Failure Root Cause Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">
          Taxonomy of why users do not return: 58% driven by completed need or natural off-season rather than product flaw
        </p>

        <div className="space-y-2.5">
          {failures.map((f) => (
            <div key={f.cause} className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">{f.cause.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500">{f.count} users</span>
                <span className="font-bold text-slate-800 w-12 text-right">{f.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
