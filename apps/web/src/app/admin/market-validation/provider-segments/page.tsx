"use client";

import React, { useEffect, useState } from "react";
import { Building2, Compass, Home, Palette, Car, Utensils } from "lucide-react";

export default function ProviderSegmentsPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/market-validation/providers?limit=100", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setProviders(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setProviders([]);
        setLoading(false);
      });
  }, []);

  const segments = [
    {
      name: "Rural Homestays & Community Lodges",
      type: "HOMESTAY",
      icon: Home,
      description: "Tribal and rural families hosting travelers with authentic home-cooked meals.",
      providers: providers.filter((p) => p.provider_type === "HOMESTAY"),
      readiness: "Moderate digital readiness, heavy WhatsApp usage",
    },
    {
      name: "Local Certified & Tribal Guides",
      type: "LOCAL_GUIDE",
      icon: Compass,
      description: "Experienced naturalists and cave/waterfall guides navigating Kanger Valley, Chitrakote, and Surguja.",
      providers: providers.filter((p) => p.provider_type === "LOCAL_GUIDE"),
      readiness: "Phone/WhatsApp, eager for steady traveler groups",
    },
    {
      name: "Traditional Artisans & Craft Cooperatives",
      type: "ARTISAN",
      icon: Palette,
      description: "Dhokra brass casters, terracotta sculptors, and wrought iron craftsmen.",
      providers: providers.filter((p) => p.provider_type === "ARTISAN"),
      readiness: "Offline-first, requires proxy concierge support",
    },
    {
      name: "Regional Eco Tour Operators",
      type: "TOUR_OPERATOR",
      icon: Building2,
      description: "Small regional agencies organizing multi-day circuits across Bastar and Mainpat.",
      providers: providers.filter((p) => p.provider_type === "TOUR_OPERATOR"),
      readiness: "Digitally mature, capable of handling quotes and bookings",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Supply Segmentation • MV3
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Provider Cohorts & Ecosystem Mapping
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Target cohorts categorized by operational capability, digital literacy, and economic alignment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((seg) => {
          const Icon = seg.icon;
          return (
            <div key={seg.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{seg.name}</h3>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">{seg.type}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-800 text-slate-200 rounded-full">
                  {seg.providers.length} registered
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3">{seg.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">Digital Maturity:</span>
                <span className="text-slate-300 font-medium">{seg.readiness}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
