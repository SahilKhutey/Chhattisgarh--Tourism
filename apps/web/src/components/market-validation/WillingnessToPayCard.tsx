import React from "react";

export interface WillingnessToPayCardProps {
  participantType?: string;
  totalResponses?: number;
  commitmentRate?: number;
  conversionRate?: number;
  averageAcceptedPrice?: number;
  tooCheapPrice?: number;
  cheapPrice?: number;
  expensivePrice?: number;
  tooExpensivePrice?: number;
  optimalPricePoint?: number;
  indifferencePricePoint?: number;
  recommendation?: string;
}

export function WillingnessToPayCard({
  participantType = "PROVIDER",
  totalResponses = 35,
  commitmentRate = 0.60,
  conversionRate = 0.428,
  averageAcceptedPrice = 25.0,
  tooCheapPrice = 5.0,
  cheapPrice = 15.0,
  expensivePrice = 35.0,
  tooExpensivePrice = 60.0,
  optimalPricePoint = 25.0,
  indifferencePricePoint = 20.0,
  recommendation = "Providers view ₹10-15 as good value, ₹25 as the sweet spot for a verified phone inquiry, and ₹50+ as high friction.",
}: WillingnessToPayCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="willingness-to-pay-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Willingness to Pay & Sensitivity Meter</h3>
          <p className="text-xs text-slate-500">
            Segment: {participantType} • Validated Responses: {totalResponses}
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Optimal: ₹{optimalPricePoint.toFixed(0)}
        </span>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Commitment Rate</div>
          <div className="text-lg font-bold text-slate-900 mt-1">{(commitmentRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Paid Conversion</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">{(conversionRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Avg Accepted</div>
          <div className="text-lg font-bold text-slate-900 mt-1">₹{averageAcceptedPrice.toFixed(0)}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Indifference Point</div>
          <div className="text-lg font-bold text-blue-700 mt-1">₹{indifferencePricePoint.toFixed(0)}</div>
        </div>
      </div>

      {/* Van Westendorp Price Spectrum */}
      <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/70 mb-3 text-xs">
        <div className="font-semibold text-slate-800 mb-2">Van Westendorp Price Range Spectrum</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded bg-white border border-slate-200">
            <div className="text-slate-400 text-[10px]">Too Cheap</div>
            <div className="font-bold text-slate-700 mt-0.5">₹{tooCheapPrice.toFixed(0)}</div>
          </div>
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
            <div className="text-emerald-700 text-[10px]">Bargain / Good</div>
            <div className="font-bold text-emerald-800 mt-0.5">₹{cheapPrice.toFixed(0)}</div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200">
            <div className="text-amber-700 text-[10px]">Expensive</div>
            <div className="font-bold text-amber-800 mt-0.5">₹{expensivePrice.toFixed(0)}</div>
          </div>
          <div className="p-2 rounded bg-rose-50 border border-rose-200">
            <div className="text-rose-700 text-[10px]">Too Expensive</div>
            <div className="font-bold text-rose-800 mt-0.5">₹{tooExpensivePrice.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
        <span className="font-semibold text-slate-800">Field Takeaway: </span>
        {recommendation}
      </p>
    </div>
  );
}
