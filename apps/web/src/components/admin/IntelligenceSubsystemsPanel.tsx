"use client";

import React, { useEffect, useState } from "react";
import {
  BrainCircuit,
  Cpu,
  Database,
  Network,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  fetchIntelligenceHealth,
  triggerIntelligenceRebuild,
} from "@/lib/api/intelligence";
import { IntelligenceHealthResponse } from "@/types/intelligence";

export const IntelligenceSubsystemsPanel: React.FC = () => {
  const [healthData, setHealthData] = useState<IntelligenceHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [rebuildStatus, setRebuildStatus] = useState<string | null>(null);

  const loadHealth = async () => {
    setIsLoading(true);
    try {
      const data = await fetchIntelligenceHealth();
      setHealthData(data);
    } catch (err) {
      console.error("Failed to load intelligence health:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleRebuild = async (target: "all" | "embeddings" | "knowledge_graph") => {
    setIsRebuilding(true);
    setRebuildStatus(`Rebuilding ${target}...`);
    try {
      const res = await triggerIntelligenceRebuild(target);
      setRebuildStatus(
        `Successfully processed ${res.published_entries_processed} published entries (${res.status})`
      );
      await loadHealth();
    } catch (err) {
      setRebuildStatus(`Rebuild failed: ${String(err)}`);
    } finally {
      setIsRebuilding(false);
    }
  };

  const intel = healthData?.intelligence;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">
              AI Intelligence & Knowledge Graph Subsystems
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production semantic embeddings, Knowledge Graph relations, and hybrid ranking engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadHealth()}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {isLoading && !healthData ? (
        <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
          Loading AI Subsystems health metrics...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subsystem Health Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(intel?.subsystems || {}).map(([name, status]) => (
              <div
                key={name}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    {name.replace("_", " ")}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 capitalize">
                    {status}
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            ))}
          </div>

          {/* Model & Knowledge Graph Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Embeddings Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Semantic Embedding Engine
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {intel?.embedding_model?.dimension ?? 1024}d
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>
                  <span className="text-slate-500">Active Model:</span>{" "}
                  <span className="text-slate-200 font-mono">
                    {intel?.embedding_model?.model_name ?? "BAAI/bge-m3"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Provider:</span>{" "}
                  <span className="text-slate-200 font-mono">
                    {intel?.embedding_model?.provider ?? "local"}
                  </span>
                </div>
              </div>

              {/* Coverage Progress Bar */}
              <div className="pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Embedding Coverage</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    {intel?.embedding_coverage?.coverage_percent ?? 100}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${intel?.embedding_coverage?.coverage_percent ?? 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>
                    {intel?.embedding_coverage?.embedded_entries ?? 0} embedded
                  </span>
                  <span>
                    {intel?.embedding_coverage?.published_entries ?? 0} published total
                  </span>
                </div>
              </div>
            </div>

            {/* Knowledge Graph Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                  <Network className="w-4 h-4 text-cyan-400" />
                  Tourism Knowledge Graph
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {intel?.graph_entities?.total_relationships ?? 0} relations
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-[10px] uppercase text-slate-500 block">
                    Total Entities
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    {intel?.graph_entities?.total_entities ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-[10px] uppercase text-slate-500 block">
                    Relationships
                  </span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {intel?.graph_entities?.total_relationships ?? 0}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                {Object.entries(intel?.graph_entities?.by_type || {}).map(
                  ([type, count]) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {type}: {count}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons & Progress Alert */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleRebuild("embeddings")}
                disabled={isRebuilding}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRebuilding ? "animate-spin" : ""}`} />
                Rebuild Embeddings
              </button>

              <button
                onClick={() => handleRebuild("knowledge_graph")}
                disabled={isRebuilding}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Network className="w-3.5 h-3.5" />
                Rebuild Knowledge Graph
              </button>

              <button
                onClick={() => handleRebuild("all")}
                disabled={isRebuilding}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition disabled:opacity-50"
              >
                Sync All Subsystems
              </button>
            </div>

            {rebuildStatus && (
              <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50 animate-fade-in">
                {rebuildStatus}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
