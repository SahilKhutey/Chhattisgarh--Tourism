import React from "react";

export interface GeoUtilityDimension {
  name: string;
  score: number; // 1 to 5
  weight: number; // 0 to 1
  benchmark: string;
}

export interface GeographicInsightsProps {
  regionId: string;
  regionName: string;
  overallScore: number; // 1 to 5
  decisionRecommendation: "VALIDATE" | "EXPAND_PILOT" | "DEPLOY" | "REVISE_MODEL";
  activationRate: number; // 0 to 1
  routeFeasibilityRate: number; // 0 to 1
  discoveryExpansionRate: number; // e.g. 2.1
  dimensions?: GeoUtilityDimension[];
}

export function GeographicInsights({
  regionId,
  regionName,
  overallScore,
  decisionRecommendation,
  activationRate,
  routeFeasibilityRate,
  discoveryExpansionRate,
  dimensions = [
    { name: "Nearby Discovery", score: 4.4, weight: 0.25, benchmark: ">40% activation" },
    { name: "Route Feasibility", score: 4.1, weight: 0.2, benchmark: ">75% realistic" },
    { name: "Zone Coherence", score: 4.2, weight: 0.2, benchmark: ">70% same-trip fit" },
    { name: "Geographic Context", score: 4.5, weight: 0.2, benchmark: ">80% orientation" },
    { name: "Travel Time Accuracy", score: 3.9, weight: 0.15, benchmark: "±20% variance" },
  ],
}: GeographicInsightsProps) {
  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "EXPAND_PILOT":
      case "DEPLOY":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "VALIDATE":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            MV4 Synthesis & Geographic Utility
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {regionName} ({regionId}) Spatial Validation
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Utility Score</div>
            <div className="text-2xl font-black text-emerald-600">{overallScore.toFixed(2)} / 5.0</div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-md border text-xs font-black uppercase tracking-wider ${getRecommendationBadge(
              decisionRecommendation
            )}`}
          >
            {decisionRecommendation.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nearby Planning Activation
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {Math.round(activationRate * 100)}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            +133% vs isolated pages
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Route Feasibility Rate
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {Math.round(routeFeasibilityRate * 100)}%
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            Validated travel corridors
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Discovery Expansion Rate
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {discoveryExpansionRate.toFixed(2)}x
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Unplanned places included
          </div>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Geographic Framework Dimensions
        </h4>
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const pct = (dim.score / 5) * 100;
            return (
              <div key={dim.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>
                    {dim.name}{" "}
                    <span className="text-slate-400 font-normal">
                      (weight: {Math.round(dim.weight * 100)}%)
                    </span>
                  </span>
                  <span>
                    {dim.score.toFixed(1)} / 5.0{" "}
                    <span className="text-slate-400 font-normal">&bull; {dim.benchmark}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
