import React from "react";

export interface UnitEconomicsRow {
  id: string;
  segment: string;
  period: string;
  spend: number;
  acquired_users: number;
  activated_users: number;
  paying_users: number;
  cac: number;
  activated_cac: number;
  arpu: number;
  contribution_margin: number;
  expected_lifespan_cycles: number;
  ltv: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
}

export interface UnitEconomicsTableProps {
  records?: UnitEconomicsRow[];
  blendedLtvCac?: number;
  isViable?: boolean;
}

const DEFAULT_RECORDS: UnitEconomicsRow[] = [
  {
    id: "ue-001",
    segment: "PROVIDER",
    period: "PILOT-PROVIDER-Q3",
    spend: 12000.0,
    acquired_users: 40,
    activated_users: 32,
    paying_users: 20,
    cac: 300.0,
    activated_cac: 375.0,
    arpu: 700.0,
    contribution_margin: 12500.0,
    expected_lifespan_cycles: 12.0,
    ltv: 7500.0,
    ltv_cac_ratio: 12.5,
    payback_period_months: 0.96,
  },
  {
    id: "ue-002",
    segment: "CONSUMER",
    period: "PILOT-CONSUMER-Q3",
    spend: 8000.0,
    acquired_users: 1600,
    activated_users: 640,
    paying_users: 65,
    cac: 5.0,
    activated_cac: 12.5,
    arpu: 149.0,
    contribution_margin: 8885.0,
    expected_lifespan_cycles: 2.5,
    ltv: 341.0,
    ltv_cac_ratio: 2.77,
    payback_period_months: 1.1,
  },
];

export function UnitEconomicsTable({
  records = DEFAULT_RECORDS,
  blendedLtvCac = 7.64,
  isViable = true,
}: UnitEconomicsTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="unit-economics-table">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Unit Economics & LTV/CAC Ledger</h3>
          <p className="text-xs text-slate-500">
            Validated acquisition spend, conversion yield, payback velocity, and lifetime value
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {`Blended LTV/CAC: ${blendedLtvCac}x`}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isViable
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            {isViable ? "VIABLE (LTV/CAC > 3x)" : "MARGINAL"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Segment</th>
              <th className="py-2.5 px-3">Period</th>
              <th className="py-2.5 px-3">Spend</th>
              <th className="py-2.5 px-3">Acquired</th>
              <th className="py-2.5 px-3">CAC</th>
              <th className="py-2.5 px-3">Act. CAC</th>
              <th className="py-2.5 px-3">ARPU</th>
              <th className="py-2.5 px-3">LTV</th>
              <th className="py-2.5 px-3">LTV / CAC</th>
              <th className="py-2.5 px-3">Payback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{r.segment}</td>
                <td className="py-2.5 px-3 text-slate-500">{r.period}</td>
                <td className="py-2.5 px-3 font-medium">{`₹${r.spend.toLocaleString()}`}</td>
                <td className="py-2.5 px-3">{r.acquired_users} ({r.paying_users} paying)</td>
                <td className="py-2.5 px-3 font-medium text-slate-800">{`₹${r.cac.toFixed(0)}`}</td>
                <td className="py-2.5 px-3 text-slate-600">{`₹${r.activated_cac.toFixed(0)}`}</td>
                <td className="py-2.5 px-3 text-slate-800">{`₹${r.arpu.toFixed(0)}`}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">{`₹${r.ltv.toFixed(0)}`}</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">{`${r.ltv_cac_ratio.toFixed(1)}x`}</td>
                <td className="py-2.5 px-3 text-blue-700 font-medium">
                  {`${r.payback_period_months.toFixed(1)} mo`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
