import React from "react";

export interface GuardrailCheck {
  guardrail: string;
  is_compliant: boolean;
  details: string;
}

export interface BusinessInsightsProps {
  primaryModel?: string;
  monetizationStrategy?: string;
  sevfInr?: number;
  grossRevenueInr?: number;
  netContributionInr?: number;
  contributionMarginPct?: number;
  providerLtvCac?: number;
  providerPaybackMonths?: number;
  consumerLtvCac?: number;
  trustRiskScore?: number;
  recommendation?: string;
  guardrails?: GuardrailCheck[];
  verdict?: string;
}

const DEFAULT_GUARDRAILS: GuardrailCheck[] = [
  {
    guardrail: "Zero-Monetization Discovery",
    is_compliant: true,
    details: "Public search, regional mapping, and district guides remain 100% free.",
  },
  {
    guardrail: "Zero Rank Manipulation",
    is_compliant: true,
    details: "Payment does not alter organic ranking algorithms or safety status.",
  },
  {
    guardrail: "Explicit Sponsored Disclosure",
    is_compliant: true,
    details: "Any promoted banner carousel requires explicit 'SPONSORED' badge.",
  },
  {
    guardrail: "Provider Surplus Protection",
    is_compliant: true,
    details: "Take rate is capped under 10% (5% for homestays) preventing OTA-style margin cannibalization.",
  },
];

export function BusinessInsights({
  primaryModel = "HYBRID_PROVIDER_FIRST",
  monetizationStrategy = "Micro-inquiry fees (₹25/lead) + Pro subscriptions (₹499/mo) + Modest booking commission (5%)",
  sevfInr = 1250000.0,
  grossRevenueInr = 146000.0,
  netContributionInr = 122500.0,
  contributionMarginPct = 83.9,
  providerLtvCac = 12.5,
  providerPaybackMonths = 0.96,
  consumerLtvCac = 2.77,
  trustRiskScore = 0.04,
  recommendation = "GO",
  guardrails = DEFAULT_GUARDRAILS,
  verdict = "MV9 confirms strong economic viability. The 'Provider-First Hybrid' model captures monetization where direct commercial value is created while keeping consumer discovery completely frictionless.",
}: BusinessInsightsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5" data-testid="business-insights">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">MV9 Executive Business Model Synthesis</h3>
          <p className="text-xs text-slate-500">
            Validated Unit Economics, Ecosystem Value Facilitated, and Final Commercial Readiness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {primaryModel}
          </span>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
            DECISION: {recommendation}
          </span>
        </div>
      </div>

      {/* Macro Economic Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase">Sustainable Value (SEVF)</div>
          <div className="text-lg font-black text-emerald-950 mt-1">{`₹${sevfInr.toLocaleString()}`}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Ecosystem commerce facilitated</div>
        </div>
        <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
          <div className="text-[11px] font-semibold text-blue-800 uppercase">Gross Platform Rev</div>
          <div className="text-lg font-black text-blue-950 mt-1">{`₹${grossRevenueInr.toLocaleString()}`}</div>
          <div className="text-[10px] text-blue-700 mt-0.5">{`${contributionMarginPct.toFixed(1)}% contribution margin`}</div>
        </div>
        <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200">
          <div className="text-[11px] font-semibold text-purple-800 uppercase">Provider LTV/CAC</div>
          <div className="text-lg font-black text-purple-950 mt-1">{`${providerLtvCac.toFixed(1)}x`}</div>
          <div className="text-[10px] text-purple-700 mt-0.5">{`Payback in ${providerPaybackMonths.toFixed(1)} months`}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-600 uppercase">Trust Risk Score</div>
          <div className="text-lg font-black text-slate-900 mt-1">{`${(trustRiskScore * 100).toFixed(1)}%`}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero ranking corruption</div>
        </div>
      </div>

      {/* Trust Guardrails Compliance Table */}
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 text-xs">
        <h4 className="font-semibold text-slate-800 mb-2">Trust Protection & Governance Guardrails (4/4 Compliant)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {guardrails.map((g, idx) => (
            <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <div className="font-semibold text-slate-800">{g.guardrail}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{g.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendation */}
      <div className="p-3.5 bg-slate-900 text-white rounded-lg text-xs leading-relaxed">
        <div className="font-bold text-emerald-400 mb-1">Strategic Final Verdict:</div>
        <p className="text-slate-200">{verdict}</p>
      </div>
    </div>
  );
}
