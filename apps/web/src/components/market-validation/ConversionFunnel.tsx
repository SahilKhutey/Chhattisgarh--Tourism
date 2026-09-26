import React from "react";

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  percentageFromInitial: number;
  dropOffRate?: number;
}

export interface ConversionFunnelProps {
  stages?: FunnelStage[];
  overallConversionRate?: number;
}

const DEFAULT_STAGES: FunnelStage[] = [
  { stage: "DESTINATION_DISCOVERY", label: "1. Destination Discovery", count: 1250, percentageFromInitial: 100, dropOffRate: 0 },
  { stage: "PROVIDER_DISCOVERY", label: "2. Provider Discovery", count: 480, percentageFromInitial: 38.4, dropOffRate: 61.6 },
  { stage: "CONTACT_INITIATED", label: "3. Contact Initiated", count: 160, percentageFromInitial: 12.8, dropOffRate: 66.7 },
  { stage: "QUALIFIED_LEAD", label: "4. Qualified Lead", count: 112, percentageFromInitial: 9.0, dropOffRate: 30.0 },
  { stage: "BOOKING_INTENT", label: "5. Booking Intent", count: 68, percentageFromInitial: 5.4, dropOffRate: 39.3 },
  { stage: "BOOKING_CONFIRMED", label: "6. Booking Confirmed", count: 42, percentageFromInitial: 3.4, dropOffRate: 38.2 },
  { stage: "EXPERIENCE_COMPLETED", label: "7. Completed Experience", count: 38, percentageFromInitial: 3.0, dropOffRate: 9.5 },
];

export function ConversionFunnel({
  stages = DEFAULT_STAGES,
  overallConversionRate = 3.0,
}: ConversionFunnelProps) {
  const maxCount = stages.length > 0 ? Math.max(...stages.map((s) => s.count)) : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">7-Stage Tourism Conversion Funnel</h3>
          <p className="text-xs text-slate-500">
            From initial regional destination discovery to verified completed travel
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 uppercase block">End-to-End Rate</span>
          <span className="text-xl font-bold text-emerald-600">{overallConversionRate}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const widthPercent = Math.max(8, Math.round((stage.count / maxCount) * 100));

          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-800">{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">{stage.count.toLocaleString()}</span>
                  <span className="text-slate-500 w-12 text-right">({stage.percentageFromInitial.toFixed(1)}%)</span>
                  {idx > 0 && stage.dropOffRate !== undefined && (
                    <span className="text-rose-500 font-mono text-[11px] w-14 text-right">
                      -{stage.dropOffRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Validation benchmark: &gt; 2.0% End-to-End Conversion</span>
        <span className="text-emerald-600 font-semibold">Healthy High-Intent Channel</span>
      </div>
    </div>
  );
}
