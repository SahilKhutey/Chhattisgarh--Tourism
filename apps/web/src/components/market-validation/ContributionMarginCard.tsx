import React from "react";

export interface CostBreakdownItem {
  category: string;
  amount: number;
  pct: number;
}

export interface ContributionMarginCardProps {
  grossRevenue?: number;
  totalVariableCost?: number;
  netContribution?: number;
  contributionMarginPct?: number;
  costBreakdown?: CostBreakdownItem[];
}

const DEFAULT_BREAKDOWN: CostBreakdownItem[] = [
  { category: "Payment Gateway Fees (2%)", amount: 2920.0, pct: 2.0 },
  { category: "SMS & WhatsApp OTP/Dispatch", amount: 4850.0, pct: 3.3 },
  { category: "Serverless & Cloud Infra", amount: 3500.0, pct: 2.4 },
  { category: "Host Verification Stipends", amount: 12230.0, pct: 8.4 },
];

export function ContributionMarginCard({
  grossRevenue = 146000.0,
  totalVariableCost = 23500.0,
  netContribution = 122500.0,
  contributionMarginPct = 83.9,
  costBreakdown = DEFAULT_BREAKDOWN,
}: ContributionMarginCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="contribution-margin-card">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Contribution Margin & Variable Cost Waterfall</h3>
        <p className="text-xs text-slate-500">
          Equation: Revenue − Payment Gateway − SMS/WhatsApp − Direct Field Verification = Net Contribution
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-500 uppercase">Gross Platform Revenue</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{`₹${grossRevenue.toLocaleString()}`}</div>
        </div>
        <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
          <div className="text-[11px] font-medium text-rose-700 uppercase">Total Variable Cost</div>
          <div className="text-xl font-bold text-rose-800 mt-1">{`-₹${totalVariableCost.toLocaleString()}`}</div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300">
          <div className="text-[11px] font-medium text-emerald-700 uppercase">Net Contribution Margin</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            {`₹${netContribution.toLocaleString()} (${contributionMarginPct.toFixed(1)}%)`}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="font-semibold text-slate-700 mb-2">Variable Cost Components:</div>
        {costBreakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-700 font-medium">{item.category}</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-[11px]">{item.pct.toFixed(1)}% of rev</span>
              <span className="font-semibold text-slate-900">₹{item.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
