"use client";

import React, { useEffect, useState } from "react";
import { ProviderPricingCard } from "@/components/market-validation/ProviderPricingCard";

interface OfferItem {
  id: string;
  offer_title: string;
  offer_description: string;
  price: number;
  currency: string;
  billing_cycle: string;
  target_type: string;
  status: string;
}

interface PolicyItem {
  id: string;
  revenue_model: string;
  eligible_surface: string;
  ranking_influence: string;
  disclosure_required: boolean;
  trust_risk: number;
  approval_status: string;
}

export default function MonetizationAdminPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/v1/market-validation/business/offers", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
      fetch("/api/v1/market-validation/business/policies", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
    ])
      .then(([offersData, policiesData]) => {
        if (Array.isArray(offersData)) setOffers(offersData);
        if (Array.isArray(policiesData)) setPolicies(policiesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Commercial Operations • MV9
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Monetization Offers &amp; Trust Policies
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog of live commercial offers, order fulfillment pipelines, and strict anti-bias trust policies.
        </p>
      </div>

      <ProviderPricingCard />

      {/* Trust Policies Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-semibold text-slate-900 text-sm">Monetization Trust &amp; Anti-Bias Policies</h3>
          <p className="text-xs text-slate-500">
            Enforcing that commercial transactions never alter search ranking, safety scores, or organic discoverability
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Revenue Model</th>
                <th className="py-2.5 px-3">Eligible Surface</th>
                <th className="py-2.5 px-3">Ranking Influence</th>
                <th className="py-2.5 px-3">Disclosure Req.</th>
                <th className="py-2.5 px-3">Trust Risk</th>
                <th className="py-2.5 px-3">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{p.revenue_model}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.eligible_surface}</td>
                  <td className="py-2.5 px-3 font-medium text-emerald-700">{p.ranking_influence}</td>
                  <td className="py-2.5 px-3 font-medium">{p.disclosure_required ? "YES" : "NO"}</td>
                  <td className="py-2.5 px-3">{(p.trust_risk * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                      {p.approval_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
