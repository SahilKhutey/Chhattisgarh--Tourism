"use client";

import React, { useEffect, useState } from "react";
import { ReviewFunnel, ReviewImpactData } from "@/components/market-validation/ReviewFunnel";

export default function ReviewsAdminPage() {
  const [data, setData] = useState<ReviewImpactData>({
    totalReviews: 84,
    verifiedPercentage: 0.94,
    totalViews: 3840,
    totalSaves: 512,
    totalBookings: 68,
    conversionRate: 0.0177,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/reviews/impact", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.total_reviews_analyzed !== undefined) {
          setData({
            totalReviews: resData.total_reviews_analyzed,
            verifiedPercentage: 0.95,
            totalViews: resData.total_downstream_views,
            totalSaves: resData.total_downstream_saves,
            totalBookings: resData.total_downstream_bookings,
            conversionRate: resData.view_to_booking_rate,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
          Reputation Supply • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Review Contribution &amp; Downstream Impact
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Validating reviews as fresh content supply that increases discovery trust and drives future booking velocity.
        </p>
      </div>

      <ReviewFunnel data={data} />
    </div>
  );
}
