"use client";

import React, { useEffect, useState } from "react";
import { ReferralFunnel, ReferralMetrics } from "@/components/market-validation/ReferralFunnel";

export default function ReferralsAdminPage() {
  const [metrics, setMetrics] = useState<ReferralMetrics>({
    totalShares: 320,
    linksOpened: 218,
    activatedUsers: 84,
    tripsCreatedFromReferral: 36,
    conversions: 18,
    shareOpenRate: 0.681,
    activationRate: 0.385,
    conversionRate: 0.056,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/referrals/funnel", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.total_shares !== undefined) {
          setMetrics({
            totalShares: data.total_shares,
            linksOpened: data.links_opened,
            activatedUsers: data.activated_users,
            tripsCreatedFromReferral: data.trips_created_from_referral,
            conversions: data.conversions,
            shareOpenRate: data.share_open_rate,
            activationRate: data.activation_rate,
            conversionRate: data.conversion_rate,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Network Growth • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Traveler Referral &amp; Trip Sharing
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking the viral coefficient of itineraries shared between traveling companions and friends.
        </p>
      </div>

      <ReferralFunnel metrics={metrics} />
    </div>
  );
}
