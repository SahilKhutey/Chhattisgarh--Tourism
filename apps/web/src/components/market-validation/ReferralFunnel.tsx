import React from "react";

export interface ReferralMetrics {
  totalShares: number;
  linksOpened: number;
  activatedUsers: number;
  tripsCreatedFromReferral: number;
  conversions: number;
  shareOpenRate: number;
  activationRate: number;
  conversionRate: number;
}

export interface ReferralFunnelProps {
  metrics: ReferralMetrics;
}

export function ReferralFunnel({
  metrics = {
    totalShares: 320,
    linksOpened: 218,
    activatedUsers: 84,
    tripsCreatedFromReferral: 36,
    conversions: 18,
    shareOpenRate: 0.681,
    activationRate: 0.385,
    conversionRate: 0.056,
  },
}: ReferralFunnelProps) {
  const steps = [
    { label: "1. Trips Shared", count: metrics.totalShares, sub: "Contextual Itineraries" },
    { label: "2. Links Opened", count: metrics.linksOpened, sub: `${(metrics.shareOpenRate * 100).toFixed(1)}% Open Rate` },
    { label: "3. New Travelers Activated", count: metrics.activatedUsers, sub: `${(metrics.activationRate * 100).toFixed(1)}% Activation` },
    { label: "4. Follow-up Trips Planned", count: metrics.tripsCreatedFromReferral, sub: "New Itineraries" },
    { label: "5. Completed Bookings", count: metrics.conversions, sub: `${(metrics.conversionRate * 100).toFixed(1)}% End-to-End` },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Viral Trip Referral Funnel</h3>
          <p className="text-xs text-slate-500">
            Organic traveler acquisition driven by shared 3-day Bastar and Surguja itineraries
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {(metrics.conversionRate * 100).toFixed(1)}% Referral Conversion
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((st, idx) => (
          <div key={st.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">{st.label}</p>
              <span className="text-[11px] text-slate-500">{st.sub}</span>
            </div>
            <span className="font-mono font-bold text-slate-900 text-sm">{st.count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
        <span>Experiment TX-01 / REF-01 confirmed:</span>
        <span className="text-indigo-600 font-semibold">Structured trip shares outperform links by 2.4x</span>
      </div>
    </div>
  );
}
