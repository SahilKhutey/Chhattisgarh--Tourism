import React from "react";

export interface ReviewImpactData {
  totalReviews: number;
  verifiedPercentage: number;
  totalViews: number;
  totalSaves: number;
  totalBookings: number;
  conversionRate: number;
}

export interface ReviewFunnelProps {
  data: ReviewImpactData;
}

export function ReviewFunnel({
  data = {
    totalReviews: 84,
    verifiedPercentage: 0.94,
    totalViews: 3840,
    totalSaves: 512,
    totalBookings: 68,
    conversionRate: 0.0177,
  },
}: ReviewFunnelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Review &amp; Content Contribution Loop</h3>
          <p className="text-xs text-slate-500">
            Reviews creating new trust assets and driving downstream booking discovery
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
          {(data.verifiedPercentage * 100).toFixed(0)}% Verified Hosts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">Reviews</span>
          <span className="text-lg font-bold text-slate-900">{data.totalReviews}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">Downstream Views</span>
          <span className="text-lg font-bold text-slate-900">{data.totalViews.toLocaleString()}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">Itinerary Saves</span>
          <span className="text-lg font-bold text-slate-900">{data.totalSaves.toLocaleString()}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">Direct Bookings</span>
          <span className="text-lg font-bold text-emerald-700">{data.totalBookings}</span>
        </div>
      </div>

      <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-900 flex justify-between items-center">
        <span>Verified reviews generate an average of 45 views and 0.8 downstream bookings each.</span>
        <span className="font-bold text-emerald-700">High Trust Signal</span>
      </div>
    </div>
  );
}
