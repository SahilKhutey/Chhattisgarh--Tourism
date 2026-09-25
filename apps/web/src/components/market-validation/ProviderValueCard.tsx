import React from "react";

export interface ProviderMetrics {
  impressions: number;
  profile_views: number;
  contacts: number;
  qualified_leads: number;
  bookings: number;
  completed_services: number;
  estimated_revenue: number;
  conversion_rate: number;
  response_time_avg_seconds: number;
  perceived_value: string;
}

export interface ProviderValueCardProps {
  metrics: ProviderMetrics;
}

export function ProviderValueCard({ metrics }: ProviderValueCardProps) {
  const convPct = Math.round(metrics.conversion_rate * 100);
  const avgMins = Math.round(metrics.response_time_avg_seconds / 60);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Economic Impact & Provider Value
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Value Delivered</h3>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
          {metrics.perceived_value} PERCEIVED VALUE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
          <div className="text-2xl font-black text-slate-900">{metrics.contacts}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Inquiries / Contacts</div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
          <div className="text-2xl font-black text-indigo-600">{metrics.qualified_leads}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Qualified Leads</div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
          <div className="text-2xl font-black text-emerald-600">{metrics.bookings}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Bookings ({convPct}%)</div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-center">
          <div className="text-2xl font-black text-emerald-700">₹{metrics.estimated_revenue.toLocaleString()}</div>
          <div className="text-xs text-emerald-800 font-medium mt-1">Est. Revenue Generated</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Completed Experiences: <strong className="text-slate-800">{metrics.completed_services}</strong>
        </div>
        <div>
          Avg Provider Response: <strong className="text-slate-800">{avgMins} mins</strong>
        </div>
      </div>
    </div>
  );
}
