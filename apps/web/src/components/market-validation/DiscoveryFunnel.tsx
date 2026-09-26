import React from "react";

export interface FunnelStepItem {
  step: string;
  count: number;
  rate: number;
}

export interface DiscoveryFunnelProps {
  steps: FunnelStepItem[];
  overallConversionRate?: number;
}

export function DiscoveryFunnel({ steps, overallConversionRate }: DiscoveryFunnelProps) {
  const maxCount = steps.length > 0 ? steps[0].count : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
            Discovery & Planning Funnel • MV5
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            Content-Driven Journey to Trip Itinerary
          </h3>
        </div>

        {overallConversionRate !== undefined && (
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Overall Conversion</div>
            <div className="text-xl font-black text-emerald-600">
              {(overallConversionRate * 100).toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {steps.map((item, idx) => {
          const widthPct = Math.max(8, Math.round((item.count / maxCount) * 100));
          const stepConversion = Math.round(item.rate * 100);

          return (
            <div key={item.step} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>
                  <span className="text-slate-400 font-mono mr-1.5">{idx + 1}.</span>
                  {item.step}
                </span>
                <span className="space-x-2">
                  <span className="text-slate-900 font-bold">{item.count.toLocaleString()}</span>
                  <span className="text-slate-400 font-normal">
                    ({stepConversion}% step conversion)
                  </span>
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
