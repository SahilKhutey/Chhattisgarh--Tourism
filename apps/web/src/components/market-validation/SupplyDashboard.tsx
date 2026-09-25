import React from "react";

export interface FunnelStats {
  total_providers: number;
  onboarded_providers: number;
  published_listings: number;
  total_leads: number;
  qualified_leads: number;
  bookings: number;
  onboarding_completion_rate: number;
  lead_qualification_rate: number;
  booking_conversion_rate: number;
}

export interface SupplyDashboardProps {
  funnel: FunnelStats;
  totalRevenue?: number;
  avgResponseMins?: number;
}

export function SupplyDashboard({
  funnel,
  totalRevenue = 0,
  avgResponseMins = 0,
}: SupplyDashboardProps) {
  const steps = [
    { label: "Providers Identified", count: funnel.total_providers, sub: "Recruited" },
    {
      label: "Onboarded",
      count: funnel.onboarded_providers,
      sub: `${Math.round(funnel.onboarding_completion_rate * 100)}% completion`,
    },
    { label: "Published Listings", count: funnel.published_listings, sub: "Verified & Quality > 40" },
    {
      label: "Qualified Inquiries",
      count: funnel.qualified_leads,
      sub: `${Math.round(funnel.lead_qualification_rate * 100)}% qualified`,
    },
    {
      label: "Confirmed Bookings",
      count: funnel.bookings,
      sub: `${Math.round(funnel.booking_conversion_rate * 100)}% conversion`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel Flow */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Tourism Supply-Side Conversion Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((s, idx) => (
            <div key={s.label} className="relative p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
              <div className="text-2xl font-black text-slate-900 mt-2">{s.count}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">{s.sub}</div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 text-xs">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Economics & Velocity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Economic Value Facilitated</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Gross transaction value directed to local providers</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            ₹
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Provider Response Velocity</div>
            <div className="text-2xl font-black text-indigo-700 mt-1">{avgResponseMins} mins</div>
            <p className="text-xs text-slate-500 mt-1">Average time from lead dispatch to provider response</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
        </div>
      </div>
    </div>
  );
}
