import React from "react";

export interface TourismCycleStep {
  stage: string;
  label: string;
  activeCount: number;
  conversionToNextPct?: number;
}

export interface TourismCycleCardProps {
  steps?: TourismCycleStep[];
  tripCycleRetentionRate?: number;
  nextTripRate?: number;
}

const DEFAULT_STEPS: TourismCycleStep[] = [
  { stage: "RESEARCH", label: "Destination Research", activeCount: 1420, conversionToNextPct: 42.5 },
  { stage: "PLANNING", label: "Trip Planning", activeCount: 604, conversionToNextPct: 34.0 },
  { stage: "BOOKING", label: "Host Booking", activeCount: 205, conversionToNextPct: 88.0 },
  { stage: "EXPERIENCE", label: "Completed Trip", activeCount: 180, conversionToNextPct: 62.0 },
  { stage: "POST_TRIP", label: "Review & Share", activeCount: 112, conversionToNextPct: 39.5 },
  { stage: "NEXT_TRIP", label: "Second Trip Started", activeCount: 44 },
];

export function TourismCycleCard({
  steps = DEFAULT_STEPS,
  tripCycleRetentionRate = 0.245,
  nextTripRate = 0.210,
}: TourismCycleCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div>
          <span className="text-[10px] font-mono text-emerald-600 uppercase font-semibold">
            Episodic Tourism Retention
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">Trip-Cycle Retention Lifecycle</h3>
          <p className="text-xs text-slate-500">
            Measuring repeat tourism tasks across distinct vacation and travel seasons
          </p>
        </div>
        <div className="flex gap-3 text-right">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-emerald-800 uppercase block font-medium">Trip-Cycle Rate</span>
            <span className="text-base font-bold text-emerald-700">{(tripCycleRetentionRate * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-blue-800 uppercase block font-medium">Next-Trip Rate</span>
            <span className="text-base font-bold text-blue-700">{(nextTripRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((st, idx) => (
          <div key={st.stage} className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Step {idx + 1}</span>
            <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{st.label}</h4>
            <p className="text-base font-bold text-slate-800 mt-1">{st.activeCount.toLocaleString()}</p>
            {st.conversionToNextPct !== undefined && (
              <span className="text-[10px] font-medium text-emerald-600 mt-1 block">
                ↓ {st.conversionToNextPct.toFixed(1)}% to next
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Strategic Rule: Do not equate absence of weekly logins with churn in tourism.</span>
        <span className="font-semibold text-emerald-700">Trip-Cycle Verified</span>
      </div>
    </div>
  );
}
