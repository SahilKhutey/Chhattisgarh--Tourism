import React from "react";

export interface BusinessVariantItem {
  variant: string;
  impressions: number;
  actions: number;
  commitments: number;
  payments: number;
  conversion_rate: number;
  total_revenue: number;
  arpu: number;
}

export interface BusinessExperimentCardProps {
  experimentId?: string;
  totalObservations?: number;
  variants?: Record<string, BusinessVariantItem>;
  winningVariant?: string;
  statisticalSignificance?: number;
  decision?: string;
  decisionRationale?: string;
}

const DEFAULT_VARIANTS: Record<string, BusinessVariantItem> = {
  CONTROL: {
    variant: "CONTROL (₹10 Lead)",
    impressions: 60,
    actions: 36,
    commitments: 25,
    payments: 25,
    conversion_rate: 0.417,
    total_revenue: 250.0,
    arpu: 10.0,
  },
  VARIANT_B: {
    variant: "VARIANT_B (₹25 Verified Lead)",
    impressions: 60,
    actions: 32,
    commitments: 23,
    payments: 23,
    conversion_rate: 0.383,
    total_revenue: 575.0,
    arpu: 25.0,
  },
};

export function BusinessExperimentCard({
  experimentId = "EXP-LEAD-PRICING-01",
  totalObservations = 120,
  variants = DEFAULT_VARIANTS,
  winningVariant = "VARIANT_B (₹25 Verified Lead)",
  statisticalSignificance = 0.96,
  decision = "WINNER_VARIANT",
  decisionRationale = "Variant B achieves +130% revenue expansion with only a negligible 3.4% conversion drop, proving high inelasticity for authenticated traveler leads.",
}: BusinessExperimentCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="business-experiment-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Business Model Experiment Evaluation</h3>
          <p className="text-xs text-slate-500">
            ID: {experimentId} • Total Observations: {totalObservations} • p-val Conf: {(statisticalSignificance * 100).toFixed(0)}%
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Decision: {decision}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {Object.entries(variants).map(([k, v]) => {
          const isWinner = v.variant === winningVariant;
          return (
            <div
              key={k}
              className={`p-3.5 rounded-lg border text-xs ${
                isWinner ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800">{v.variant}</span>
                {isWinner && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    WINNING VARIANT
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 my-1 text-center">
                <div>
                  <div className="text-slate-400 text-[10px]">Conversion</div>
                  <div className="font-bold text-slate-800">{(v.conversion_rate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Paid Count</div>
                  <div className="font-bold text-emerald-700">{v.payments} / {v.impressions}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Total Revenue</div>
                  <div className="font-bold text-slate-900">₹{v.total_revenue.toFixed(0)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
        <span className="font-semibold text-slate-800">Conclusion: </span>
        <span className="text-slate-600">{decisionRationale}</span>
      </div>
    </div>
  );
}
