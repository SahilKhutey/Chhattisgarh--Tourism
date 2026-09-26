import React from "react";

export interface NetworkDensityData {
  totalTravelers: number;
  activeProviders: number;
  activeCreators: number;
  destinationsRepresented: number;
  totalInteractions: number;
  interactionsPerActiveUser: number;
  travelerToProviderEdges: number;
  travelerToDestinationEdges: number;
  travelerToCreatorEdges: number;
  networkHealthScore: number;
  interpretation?: string;
}

export interface NetworkEffectCardProps {
  data: NetworkDensityData;
}

export function NetworkEffectCard({
  data = {
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
  },
}: NetworkEffectCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
            Tourism Network Graph
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Cross-Side Network Effects &amp; Density</h3>
          <p className="text-xs text-slate-400">
            Reinforcing marketplace utility: content, supply coverage, and traveler demand
          </p>
        </div>
        <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-xl px-3.5 py-1.5 text-right">
          <span className="text-[10px] text-indigo-300 block uppercase font-medium">Network Health</span>
          <span className="text-xl font-bold text-indigo-400">{data.networkHealthScore.toFixed(1)}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Travelers</span>
          <p className="text-lg font-bold text-white mt-0.5">{data.totalTravelers.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Active Hosts</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{data.activeProviders}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Storytellers</span>
          <p className="text-lg font-bold text-purple-400 mt-0.5">{data.activeCreators}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Destinations</span>
          <p className="text-lg font-bold text-blue-400 mt-0.5">{data.destinationsRepresented}</p>
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
          Cross-Side Relationship Density
        </span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
            <span className="font-bold text-emerald-400 text-sm block">{data.travelerToProviderEdges}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Traveler ↔ Host</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
            <span className="font-bold text-blue-400 text-sm block">{data.travelerToDestinationEdges}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Traveler ↔ Destination</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
            <span className="font-bold text-purple-400 text-sm block">{data.travelerToCreatorEdges}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Traveler ↔ Creator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
