"use client";

import React, { useEffect, useState } from "react";
import { NetworkEffectCard, NetworkDensityData } from "@/components/market-validation/NetworkEffectCard";

interface NetworkGapItem {
  id: string;
  geography: string;
  destination: string;
  provider_supply_count: number;
  content_supply_count: number;
  traveler_demand_score: number;
  opportunity_score: number;
  recommended_action: string;
}

export default function NetworkAdminPage() {
  const [networkData, setNetworkData] = useState<NetworkDensityData>({
    totalTravelers: 1240,
    activeProviders: 86,
    activeCreators: 24,
    destinationsRepresented: 112,
    totalInteractions: 4821,
    interactionsPerActiveUser: 3.57,
    travelerToProviderEdges: 812,
    travelerToDestinationEdges: 2441,
    travelerToCreatorEdges: 318,
    networkHealthScore: 78.4,
    interpretation: "DEVELOPING_REGIONAL_ECOSYSTEM",
  });
  const [gaps, setGaps] = useState<NetworkGapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/v1/market-validation/retention/network/density", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
      fetch("/api/v1/market-validation/retention/network/health", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
      fetch("/api/v1/market-validation/retention/network/gaps", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
    ])
      .then(([densityRes, healthRes, gapsRes]) => {
        if (densityRes.total_travelers !== undefined) {
          setNetworkData({
            totalTravelers: densityRes.total_travelers,
            activeProviders: densityRes.active_providers,
            activeCreators: densityRes.active_creators,
            destinationsRepresented: densityRes.destinations_represented,
            totalInteractions: densityRes.total_meaningful_interactions,
            interactionsPerActiveUser: densityRes.interactions_per_active_user,
            travelerToProviderEdges: densityRes.traveler_to_provider_edges,
            travelerToDestinationEdges: densityRes.traveler_to_destination_edges,
            travelerToCreatorEdges: densityRes.traveler_to_creator_edges,
            networkHealthScore: healthRes.network_health_score || 78.4,
            interpretation: healthRes.interpretation || "DEVELOPING_REGIONAL_ECOSYSTEM",
          });
        }
        if (Array.isArray(gapsRes)) {
          setGaps(gapsRes);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
          Network Topology • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Regional Tourism Network Effects
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Auditing whether increased supply and creator content systematically increase traveler utility and discovery density.
        </p>
      </div>

      <NetworkEffectCard data={networkData} />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-sm mb-1">Network Opportunity &amp; Supply Gap Detection</h3>
        <p className="text-xs text-slate-500 mb-4">
          Automated identification of destinations with high traveler search demand but constrained provider supply
        </p>

        <div className="space-y-3">
          {gaps.map((g) => (
            <div key={g.id || g.destination} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{g.destination}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {g.geography}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{g.recommended_action}</p>
                <div className="flex gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                  <span>Demand: <strong>{g.traveler_demand_score}/100</strong></span>
                  <span>Providers: <strong>{g.provider_supply_count}</strong></span>
                  <span>Content: <strong>{g.content_supply_count}</strong></span>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Opportunity</span>
                <span className="text-lg font-bold text-emerald-600">{g.opportunity_score.toFixed(1)}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
