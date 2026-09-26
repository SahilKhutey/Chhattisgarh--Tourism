"use client";

import React, { useEffect, useState } from "react";
import { DiscoveryFunnel, FunnelStepItem } from "@/components/market-validation/DiscoveryFunnel";
import { Compass, Search, Filter, ArrowRight, Activity, Eye, Bookmark, MapPin } from "lucide-react";

export default function DiscoveryAdminPage() {
  const [funnelData, setFunnelData] = useState<FunnelStepItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/content/discovery/funnel", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load funnel");
        return res.json();
      })
      .then((data) => {
        if (data.steps) {
          const mapped: FunnelStepItem[] = data.steps.map((s: any) => ({
            step: s.step || s.name,
            count: s.count,
            rate: s.rate !== undefined ? s.rate : s.conversionRate || 0.5,
          }));
          setFunnelData(mapped);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback mockup funnel data
        setFunnelData([
          { step: "Content Impression", count: 42000, rate: 1.0 },
          { step: "Content Open / View", count: 16800, rate: 0.4 },
          { step: "Engaged Read (>45s)", count: 9240, rate: 0.55 },
          { step: "Save / Bookmark", count: 4620, rate: 0.5 },
          { step: "Second Destination Click", count: 3234, rate: 0.7 },
          { step: "Itinerary Draft Start", count: 1617, rate: 0.5 },
          { step: "Provider Inquiry Sent", count: 485, rate: 0.3 },
        ]);
        setLoading(false);
      });

    // Mock initial recent events
    setEvents([
      {
        id: "evt-101",
        event_type: "ITINERARY_START",
        source: "THEMATIC_SEARCH",
        content_id: "CONT_CHITRAKOTE_EXP",
        destination_id: "DEST_CHITRAKOTE",
        timestamp: "2 mins ago",
      },
      {
        id: "evt-102",
        event_type: "SECOND_DESTINATION_VIEW",
        source: "NEARBY_CLUSTER",
        content_id: "CONT_TIRATHGARH_PRAC",
        destination_id: "DEST_TIRATHGARH",
        timestamp: "5 mins ago",
      },
      {
        id: "evt-103",
        event_type: "CONTENT_SAVE",
        source: "MAP_EXPLORATION",
        content_id: "CONT_MAINPAT_OVERVIEW",
        destination_id: "DEST_MAINPAT",
        timestamp: "12 mins ago",
      },
      {
        id: "evt-104",
        event_type: "ENGAGED_SESSION",
        source: "THEMATIC_SEARCH",
        content_id: "CONT_CHITRAKOTE_EXP",
        destination_id: "DEST_CHITRAKOTE",
        timestamp: "15 mins ago",
      },
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    fetch(
      `/api/v1/market-validation/content/discovery/search?query=${encodeURIComponent(
        searchQuery
      )}&intent=WEEKEND_TRIP`,
      {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => {
        setSearchResults(data.results || []);
        setIsSearching(false);
      })
      .catch(() => {
        // Fallback simulation
        setSearchResults([
          {
            content_id: "CONT_CHITRAKOTE_EXP",
            title: "Chitrakote Falls: The Definitive Monsoon & Winter Guide",
            match_score: 0.94,
            intent_alignment: "HIGH",
            cohort: "BASTAR_CIRCUIT",
            snippets: ["Water flow timings", "NH63 road conditions", "Boat safari bookings"],
          },
          {
            content_id: "CONT_TIRATHGARH_PRAC",
            title: "Tirathgarh Step-Fall Logistics & Timings",
            match_score: 0.88,
            intent_alignment: "HIGH",
            cohort: "BASTAR_CIRCUIT",
            snippets: ["Tiered cascade access", "Forest permit requirements"],
          },
        ]);
        setIsSearching(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
              MV5 • DISCOVERY
            </span>
            <span className="text-xs text-slate-400 font-mono">Attribution & Funnels</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Destination Discovery Funnel & Attribution Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Measure how travelers progress from initial impression to structured itinerary planning.
          </p>
        </div>
      </div>

      {/* Discovery Funnel */}
      <DiscoveryFunnel steps={funnelData} />

      {/* Search Intent Simulator & Recent Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intent Search Simulator */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Search Intent Simulator</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Natural Language Intent</span>
          </div>

          <form onSubmit={handleSimulateSearch} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Best waterfalls for family in Bastar"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSearching ? "Simulating..." : "Test Intent"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-400">Quick tests:</span>
              {["Monsoon circuit", "Tribal craft workshops", "Tiger Point Surguja"].map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setSearchQuery(q)}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </form>

          {/* Results */}
          <div className="space-y-2 pt-2">
            {searchResults.map((res) => (
              <div
                key={res.content_id}
                className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{res.title}</span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Match: {(res.match_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {res.snippets?.map((snip: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 text-[10px]"
                    >
                      {snip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Event Stream */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Attribution Event Stream</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">Live Feed</span>
          </div>

          <div className="space-y-2.5">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {evt.event_type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      via {evt.source}
                    </span>
                  </div>
                  <span className="font-mono text-slate-700 text-[11px] block mt-1">
                    {evt.content_id}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
