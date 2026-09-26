import React from "react";

export interface RevenueStreamRow {
  id: string;
  customer_type: string;
  stream_type: string;
  description: string;
  base_price: number;
  currency: string;
  pricing_unit: string;
  estimated_conversion: number;
  estimated_margin: number;
  status: string;
}

export interface RevenueStreamTableProps {
  streams?: RevenueStreamRow[];
}

const DEFAULT_STREAMS: RevenueStreamRow[] = [
  {
    id: "str-001",
    customer_type: "PROVIDER",
    stream_type: "QUALIFIED_LEAD_FEE",
    description: "Fee per verified traveler booking lead with dates & headcount",
    base_price: 25.0,
    currency: "INR",
    pricing_unit: "per qualified lead",
    estimated_conversion: 0.18,
    estimated_margin: 0.68,
    status: "ACTIVE",
  },
  {
    id: "str-002",
    customer_type: "PROVIDER",
    stream_type: "BOOKING_COMMISSION",
    description: "Performance fee on completed assisted booking transactions",
    base_price: 280.0,
    currency: "INR",
    pricing_unit: "per booking (6%)",
    estimated_conversion: 0.12,
    estimated_margin: 0.74,
    status: "ACTIVE",
  },
  {
    id: "str-003",
    customer_type: "PROVIDER",
    stream_type: "PRO_PROVIDER_SUBSCRIPTION",
    description: "Pro tier with inquiry CRM, analytics & priority dispatch",
    base_price: 499.0,
    currency: "INR",
    pricing_unit: "per month",
    estimated_conversion: 0.08,
    estimated_margin: 0.90,
    status: "ACTIVE",
  },
  {
    id: "str-004",
    customer_type: "CONSUMER",
    stream_type: "ARTISAN_CULTURAL_TRAIL_PASS",
    description: "Self-guided digital access pass with offline audio & artisan invites",
    base_price: 149.0,
    currency: "INR",
    pricing_unit: "per pass",
    estimated_conversion: 0.06,
    estimated_margin: 0.85,
    status: "ACTIVE",
  },
];

export function RevenueStreamTable({ streams = DEFAULT_STREAMS }: RevenueStreamTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="revenue-stream-table">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Revenue Streams Inventory</h3>
        <p className="text-xs text-slate-500">
          Target pricing units, conversion projections, and gross contribution margins
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Stream Type</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Base Price</th>
              <th className="py-2.5 px-3">Pricing Unit</th>
              <th className="py-2.5 px-3">Est. Conversion</th>
              <th className="py-2.5 px-3">Contribution Margin</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {streams.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-800">{s.stream_type}</td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    s.customer_type === "PROVIDER" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {s.customer_type}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  {s.currency === "INR" ? "₹" : ""}{s.base_price.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-slate-500">{s.pricing_unit}</td>
                <td className="py-2.5 px-3 text-emerald-700 font-medium">
                  {(s.estimated_conversion * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 text-blue-700 font-medium">
                  {(s.estimated_margin * 100).toFixed(0)}%
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                    {s.status}
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
