import React from "react";

export interface MarketCandidateItem {
  id: string;
  geography_id: string;
  demand_score: number;
  supply_score: number;
  content_score: number;
  geographic_score: number;
  accessibility_score: number;
  operational_score: number;
  risk_score: number;
  evidence_strength: string;
  pilot_priority: number;
  recommendation: string;
  composite_score: number;
}

export interface MarketSelectionMatrixProps {
  markets: MarketCandidateItem[];
  onSelectMarket?: (market: MarketCandidateItem) => void;
}

export function MarketSelectionMatrix({
  markets,
  onSelectMarket,
}: MarketSelectionMatrixProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="market-selection-matrix">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Market Selection Prioritization Matrix</h3>
          <p className="text-xs text-slate-500">
            Multi-factor scoring across demand, supply, content, accessibility, and operational risk
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          {markets.length} Evaluated Circuits
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Geography</th>
              <th className="py-2.5 px-3 text-right">Demand</th>
              <th className="py-2.5 px-3 text-right">Supply</th>
              <th className="py-2.5 px-3 text-right">Content</th>
              <th className="py-2.5 px-3 text-right">Geo/Access</th>
              <th className="py-2.5 px-3 text-right">Risk</th>
              <th className="py-2.5 px-3 text-right">Composite</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {markets.map((m) => (
              <tr
                key={m.id}
                onClick={() => onSelectMarket?.(m)}
                className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                  m.pilot_priority === 1 ? "bg-emerald-50/40" : ""
                }`}
              >
                <td className="py-2.5 px-3 font-bold text-slate-900">#{m.pilot_priority}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  {m.geography_id}
                  {m.pilot_priority === 1 && (
                    <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right">{m.demand_score}</td>
                <td className="py-2.5 px-3 text-right">{m.supply_score}</td>
                <td className="py-2.5 px-3 text-right">{m.content_score}</td>
                <td className="py-2.5 px-3 text-right">{((m.geographic_score + m.accessibility_score) / 2).toFixed(1)}</td>
                <td className="py-2.5 px-3 text-right text-rose-600 font-medium">{m.risk_score}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">{m.composite_score}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.recommendation === "RECOMMENDED_PILOT"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {m.recommendation.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
