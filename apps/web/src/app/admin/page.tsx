"use client";

import { useEffect, useState } from "react";
import { fetchAtisStats, AtisStats } from "../data/api";
import { Activity, MapPin, ShieldAlert, Cpu } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AtisStats | null>(null);

  useEffect(() => {
    fetchAtisStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="animate-pulse text-teal-500">Initializing ATIS Systems...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Mission Control</h1>
          <p className="text-slate-400 text-sm mt-1">Autonomous Tourism Intelligence System Overview</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
          stats.systemHealth === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          SYSTEM {stats.systemHealth}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <MapPin className="w-16 h-16 text-teal-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Knowledge Nodes</p>
          <p className="text-4xl font-light text-white">{stats.totalNodes}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Active System Flags</p>
          <p className="text-4xl font-light text-white">{stats.activeFlags}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Pending AI Discoveries</p>
          <p className="text-4xl font-light text-white">{stats.pendingDiscoveries}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Verified Destinations</p>
          <p className="text-4xl font-light text-white">{stats.verifiedNodes}</p>
        </div>
      </div>

      {/* Live Terminal Feed */}
      <div className="mt-8 bg-[#0a0f18] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center">
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Live System Stream</h3>
        </div>
        <div className="p-6 h-64 overflow-y-auto font-mono text-sm space-y-3">
          <div className="flex text-emerald-400">
            <span className="w-24 opacity-50 flex-shrink-0">12:00:01</span>
            <span>[DiscoveryEngine] Initiating periodic hashtag cluster scan...</span>
          </div>
          <div className="flex text-emerald-400">
            <span className="w-24 opacity-50 flex-shrink-0">12:00:15</span>
            <span>[DiscoveryEngine] 1 new node synthesized. Triggering VerificationEvent.</span>
          </div>
          <div className="flex text-amber-400">
            <span className="w-24 opacity-50 flex-shrink-0">12:05:22</span>
            <span>[MediaUnderstanding] Processing incoming asset for Chitrakote Falls...</span>
          </div>
          <div className="flex text-rose-400">
            <span className="w-24 opacity-50 flex-shrink-0">12:05:24</span>
            <span>[SystemFlag] HealthEngine raised OUTDATED_CONTENT flag on Node ID: 88.</span>
          </div>
          <div className="flex text-slate-500">
            <span className="animate-pulse">Awaiting next telemetry cycle (every 15 min)...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
