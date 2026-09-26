import React from "react";

export interface PricingVariantMetric {
  price: number;
  conversion_rate: number;
  revenue_per_lead: number;
}

export interface PricingExperimentProps {
  experimentId?: string;
  experimentType?: string;
  sampleSize?: number;
  controlPrice?: number;
  variantMetrics?: Record<string, PricingVariantMetric>;
  elasticity?: number;
  recommendedPrice?: number;
  confidenceLevel?: number;
  recommendation?: string;
}

const DEFAULT_METRICS: Record<string, PricingVariantMetric> = {
  CONTROL: { price: 10.0, conversion_rate: 0.42, revenue_per_lead: 4.2 },
  VARIANT_B: { price: 25.0, conversion_rate: 0.38, revenue_per_lead: 9.5 },
  VARIANT_C: { price: 50.0, conversion_rate: 0.19, revenue_per_lead: 9.5 },
};

export function PricingExperiment({
  experimentId = "EXP-LEAD-001",
  experimentType = "LEAD_FEE",
  sampleSize = 120,
  controlPrice = 10.0,
  variantMetrics = DEFAULT_METRICS,
  elasticity = -0.063,
  recommendedPrice = 25.0,
  confidenceLevel = 0.95,
  recommendation = "Price elasticity is -0.063 (inelastic). ₹25 per verified lead maximizes provider surplus and delivers verified traveler quality.",
}: PricingExperimentProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="pricing-experiment">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Pricing Elasticity Experiment: {experimentType}</h3>
          <p className="text-xs text-slate-500">
            ID: {experimentId} • Sample: {sampleSize} active operators • Confidence: {Math.round(confidenceLevel * 100)}%
          </p>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {`Optimal: ₹${recommendedPrice.toFixed(2)}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {Object.entries(variantMetrics).map(([key, m]) => {
          const isWinner = m.price === recommendedPrice;
          return (
            <div
              key={key}
              className={`p-3.5 rounded-lg border text-xs ${
                isWinner ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800">{key}</span>
                {isWinner && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    WINNER
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-slate-900 my-1">₹{m.price.toFixed(0)}</div>
              <div className="flex justify-between text-slate-500 mt-2">
                <span>Conversion:</span>
                <span className="font-semibold text-slate-700">{(m.conversion_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-500 mt-1">
                <span>Rev / Inquiry:</span>
                <span className="font-semibold text-slate-800">₹{m.revenue_per_lead.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div className="font-semibold text-slate-800">
          Elasticity (ε): <span className="text-blue-700">{elasticity.toFixed(3)}</span> (Highly Inelastic)
        </div>
        <div className="text-slate-600 mt-1">{recommendation}</div>
      </div>
    </div>
  );
}
