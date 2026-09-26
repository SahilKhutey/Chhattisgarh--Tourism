import React from "react";

export interface ExpansionCandidateItem {
  id: string;
  current_market_id: string;
  candidate_market_id: string;
  similarity_score: number;
  demand_score: number;
  supply_score: number;
  geographic_fit: number;
  operational_fit: number;
  economic_fit: number;
  expansion_risk: number;
  composite_expansion_score: number;
  recommendation: string;
}

export interface ExpansionCandidateTableProps {
  candidates: ExpansionCandidateItem[];
}

export function ExpansionCandidateTable({
  candidates,
}: ExpansionCandidateTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="expansion-candidate-table">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Transferability & Expansion Modeling</h3>
          <p className="text-xs text-slate-500">
            Algorithmic readiness scoring for horizontal replication from Bastar to next circuits
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          Source: Bastar Core
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Target Candidate</th>
              <th className="py-2.5 px-3 text-right">Similarity</th>
              <th className="py-2.5 px-3 text-right">Demand Fit</th>
              <th className="py-2.5 px-3 text-right">Supply Fit</th>
              <th className="py-2.5 px-3 text-right">Operational Fit</th>
              <th className="py-2.5 px-3 text-right">Risk</th>
              <th className="py-2.5 px-3 text-right">Transfer Score</th>
              <th className="py-2.5 px-3 text-center">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-800">{c.candidate_market_id}</td>
                <td className="py-2.5 px-3 text-right">{c.similarity_score}</td>
                <td className="py-2.5 px-3 text-right">{c.demand_score}</td>
                <td className="py-2.5 px-3 text-right">{c.supply_score}</td>
                <td className="py-2.5 px-3 text-right">{c.operational_fit}</td>
                <td className="py-2.5 px-3 text-right text-rose-600 font-medium">{c.expansion_risk}</td>
                <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{c.composite_expansion_score}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.recommendation === "RECOMMENDED_NEXT_EXPANSION"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {c.recommendation.replace(/_/g, " ")}
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
