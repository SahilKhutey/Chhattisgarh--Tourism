import React from "react";

export interface CohortRow {
  id: string;
  cohort_date: string;
  acquisition_source: string;
  cohort_size: number;
  d1_rate: number;
  d7_rate: number;
  d30_rate: number;
  trip_cycle_rate: number;
  next_trip_rate: number;
  destination_expansion_rate: number;
}

export interface RetentionCohortTableProps {
  cohorts: CohortRow[];
}

export function RetentionCohortTable({ cohorts }: RetentionCohortTableProps) {
  const formatPct = (val: number) => `${(val * 100).toFixed(1)}%`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Consumer Retention Cohorts</h3>
          <p className="text-xs text-slate-500">
            D1-D30 diagnostic retention paired with primary Trip-Cycle &amp; Next-Trip rates
          </p>
        </div>
        <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
          MV8 Cohorts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 font-semibold text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">Cohort Date / Source</th>
              <th scope="col" className="px-3 py-3 text-right">Size</th>
              <th scope="col" className="px-3 py-3 text-right text-slate-500">D1 (Diag)</th>
              <th scope="col" className="px-3 py-3 text-right text-slate-500">D7 (Diag)</th>
              <th scope="col" className="px-3 py-3 text-right text-slate-500">D30 (Diag)</th>
              <th scope="col" className="px-3 py-3 text-right font-bold text-emerald-700 bg-emerald-50/50">
                Trip Cycle Rate
              </th>
              <th scope="col" className="px-3 py-3 text-right font-bold text-blue-700 bg-blue-50/50">
                Next-Trip Rate
              </th>
              <th scope="col" className="px-3 py-3 text-right text-indigo-700">Dest. Expansion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {cohorts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-400">
                  No cohort records found.
                </td>
              </tr>
            ) : (
              cohorts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div>{c.cohort_date}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {c.acquisition_source}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{c.cohort_size.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-slate-500 font-mono">{formatPct(c.d1_rate)}</td>
                  <td className="px-3 py-3 text-right text-slate-500 font-mono">{formatPct(c.d7_rate)}</td>
                  <td className="px-3 py-3 text-right text-slate-500 font-mono">{formatPct(c.d30_rate)}</td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-700 bg-emerald-50/30 font-mono">
                    {formatPct(c.trip_cycle_rate)}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-blue-700 bg-blue-50/30 font-mono">
                    {formatPct(c.next_trip_rate)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-indigo-700 font-medium">
                    {formatPct(c.destination_expansion_rate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
