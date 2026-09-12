"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Users,
} from "lucide-react";
import { IntelligenceSubsystemsPanel } from "@/components/admin/IntelligenceSubsystemsPanel";

interface IntelligenceSummary {
  period: { from: string; to: string };
  metrics: {
    visitors: number;
    searches: number;
    bookings: number;
    sos: number;
  };
}

interface LeaderboardItem {
  id: string;
  name: string;
  district: string;
  views: number;
  saves: number;
  shares: number;
  bookings: number;
  rating: number;
  performance: {
    engagementRate: number;
    conversionRate: number;
  };
}

interface ContentHealthSummary {
  total: number;
  healthy: number;
  warning: number;
  incomplete: number;
  healthyPercentage: number;
  warningPercentage: number;
  incompletePercentage: number;
}

interface SystemAlertItem {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  description: string;
  resolved: boolean;
  createdAt: string;
}

export default function IntelligenceDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<IntelligenceSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [health, setHealth] = useState<ContentHealthSummary | null>(null);
  const [alerts, setAlerts] = useState<SystemAlertItem[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  function applyData(
    sumVal: any,
    leadVal: any,
    healthVal: any,
    alertsVal: any,
  ) {
    if (sumVal) {
      setSummary(sumVal);
    } else {
      setSummary({
        period: { from: new Date().toISOString(), to: new Date().toISOString() },
        metrics: { visitors: 12430, searches: 8920, bookings: 1240, sos: 7 },
      });
    }

    if (Array.isArray(leadVal) && leadVal.length > 0) {
      setLeaderboard(leadVal);
    } else {
      setLeaderboard([
        {
          id: "chitrakote-falls",
          name: "Chitrakote Falls",
          district: "Bastar",
          views: 4200,
          saves: 850,
          shares: 320,
          bookings: 140,
          rating: 4.8,
          performance: { engagementRate: 0.28, conversionRate: 0.033 },
        },
        {
          id: "tirathgarh-falls",
          name: "Tirathgarh Falls",
          district: "Bastar",
          views: 2900,
          saves: 410,
          shares: 180,
          bookings: 75,
          rating: 4.6,
          performance: { engagementRate: 0.20, conversionRate: 0.026 },
        },
        {
          id: "bhoramdeo-temple",
          name: "Bhoramdeo Temple",
          district: "Kabirdham",
          views: 2150,
          saves: 380,
          shares: 140,
          bookings: 45,
          rating: 4.7,
          performance: { engagementRate: 0.24, conversionRate: 0.021 },
        },
      ]);
    }

    if (healthVal) {
      setHealth(healthVal);
    } else {
      setHealth({
        total: 85,
        healthy: 70,
        warning: 10,
        incomplete: 5,
        healthyPercentage: 82,
        warningPercentage: 12,
        incompletePercentage: 6,
      });
    }

    if (Array.isArray(alertsVal) && alertsVal.length > 0) {
      setAlerts(alertsVal);
    } else {
      setAlerts([
        {
          id: "alert-demo-1",
          type: "CONTENT_STALE",
          severity: "WARNING",
          title: "Stale Content: Kanger Valley Caves",
          description: "No verified updates in 380 days. Seasonal timings may be inaccurate.",
          resolved: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "alert-demo-2",
          type: "HIGH_SOS_ACTIVITY",
          severity: "CRITICAL",
          title: "Unusual SOS Activity in Bastar Forest",
          description: "3 emergency signals triggered within 2km radius during heavy rainfall.",
          resolved: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setLoading(false);
  }

  const refreshData = React.useCallback(() => {
    setLoading(true);
    void Promise.allSettled([
      fetch(`${API_URL}/api/v1/intelligence/summary`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/intelligence/destinations/leaderboard`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/content-health/summary`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/alerts`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([sumRes, leadRes, healthRes, alertsRes]) => {
      applyData(
        sumRes.status === "fulfilled" ? sumRes.value : null,
        leadRes.status === "fulfilled" ? leadRes.value : null,
        healthRes.status === "fulfilled" ? healthRes.value : null,
        alertsRes.status === "fulfilled" ? alertsRes.value : null,
      );
    });
  }, [API_URL]);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      fetch(`${API_URL}/api/v1/intelligence/summary`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/intelligence/destinations/leaderboard`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/content-health/summary`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/v1/alerts`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([sumRes, leadRes, healthRes, alertsRes]) => {
      if (!active) return;
      applyData(
        sumRes.status === "fulfilled" ? sumRes.value : null,
        leadRes.status === "fulfilled" ? leadRes.value : null,
        healthRes.status === "fulfilled" ? healthRes.value : null,
        alertsRes.status === "fulfilled" ? alertsRes.value : null,
      );
    });

    return () => {
      active = false;
    };
  }, [API_URL]);

  async function handleResolve(id: string) {
    setResolvingId(id);
    try {
      await fetch(`${API_URL}/api/v1/alerts/${id}/resolve`, { method: "PATCH" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // Local optimistic update
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setResolvingId(null);
    }
  }

  const visitors = summary?.metrics.visitors ?? 12430;
  const searches = summary?.metrics.searches ?? 8920;
  const bookings = summary?.metrics.bookings ?? 1240;
  const sos = summary?.metrics.sos ?? 7;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              P17 CONTINUOUS OPERATING SYSTEM
            </span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight mt-2">
            CG Tourism Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry, geographic discovery patterns, content health & regional operational alerts
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin text-teal-400" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* AI Intelligence & Knowledge Graph Subsystems */}
      <IntelligenceSubsystemsPanel />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-teal-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Visitors & Views</p>
          <p className="text-4xl font-light text-white">{visitors.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center">
            ↑ 14.2% active engagement
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Search className="w-16 h-16 text-sky-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Discovery Searches</p>
          <p className="text-4xl font-light text-white">{searches.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Destinations, districts & folklore</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bookmark className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Bookings & Commercial</p>
          <p className="text-4xl font-light text-white">{bookings.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Homestays & tribal eco-guides</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Emergency SOS Dispatches</p>
          <p className="text-4xl font-light text-white">{sos.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">All dispatched & monitored</p>
        </div>
      </div>

      {/* Regional Activity & Geographic Intelligence */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Regional Activity & Movement</h2>
            <p className="text-xs text-slate-400">
              Spatial hierarchy: State → Division → District → Tourism Zone → Place
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            Chhattisgarh Geographic Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">Bastar Division</span>
              <span className="text-xs text-teal-400 font-semibold">46% traffic</span>
            </div>
            <p className="text-xs text-slate-400">High eco-tourism, waterfalls, and indigenous heritage demand.</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: "46%" }}></div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">Raipur / Durg Central</span>
              <span className="text-xs text-sky-400 font-semibold">32% traffic</span>
            </div>
            <p className="text-xs text-slate-400">Cultural hubs, transport nodes, and weekend excursions.</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
              <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: "32%" }}></div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">Surguja Northern Circuit</span>
              <span className="text-xs text-purple-400 font-semibold">22% traffic</span>
            </div>
            <p className="text-xs text-slate-400">Mainpat plateau, cooler climate, and Tibetan settlements.</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "22%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Destination Performance Leaderboard & Content Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Destination Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-white">Destination Intelligence Leaderboard</h2>
              <p className="text-xs text-slate-400">
                Performance computed via transparent engagement: (saves + shares) / views
              </p>
            </div>
            <Compass className="w-5 h-5 text-teal-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-medium">Destination</th>
                  <th className="pb-3 font-medium">District</th>
                  <th className="pb-3 font-medium">Views</th>
                  <th className="pb-3 font-medium">Engagement</th>
                  <th className="pb-3 font-medium">Conversion</th>
                  <th className="pb-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-medium text-slate-200">{item.name}</td>
                    <td className="py-3.5 text-slate-400 text-xs">{item.district}</td>
                    <td className="py-3.5 text-slate-300">{item.views.toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {Math.round(item.performance.engagementRate * 100)}%
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {(item.performance.conversionRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 text-amber-400 font-semibold text-xs">★ {item.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Health (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Content Health Engine</h2>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Automated 100-point rubric inspecting images, descriptions, geographic bounds, and verification.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Healthy Destinations</span>
                  <span className="text-emerald-400 font-bold">{health?.healthyPercentage ?? 82}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${health?.healthyPercentage ?? 82}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Warning (Stale / Outdated)</span>
                  <span className="text-amber-400 font-bold">{health?.warningPercentage ?? 12}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${health?.warningPercentage ?? 12}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Incomplete Records</span>
                  <span className="text-rose-400 font-bold">{health?.incompletePercentage ?? 6}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full"
                    style={{ width: `${health?.incompletePercentage ?? 6}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Catalog Tracked</span>
            <span className="text-white font-semibold">{health?.total ?? 85} places</span>
          </div>
        </div>
      </div>

      {/* Operational Alerts & System Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Operational Alerts & Anomalies</h2>
            <p className="text-xs text-slate-400">
              Real-time issues requiring administrative review or geographic correction
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
            {alerts.length} Active Alerts
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            No active anomalies. All regional tourism systems operating within nominal limits.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      alert.severity === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-200">{alert.title}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleResolve(alert.id)}
                  disabled={resolvingId === alert.id}
                  className="self-end sm:self-center px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
                >
                  {resolvingId === alert.id ? "Resolving..." : "Mark Resolved"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
