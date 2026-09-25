import React from "react";

export interface LeadStatusProps {
  status: string;
  qualified?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  CONTACTED: "bg-purple-100 text-purple-800 border-purple-200",
  QUALIFIED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  RESPONDED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  NEGOTIATING: "bg-amber-100 text-amber-800 border-amber-200",
  BOOKED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  LOST: "bg-rose-100 text-rose-800 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-800 border-slate-200",
};

export function LeadStatus({ status, qualified }: LeadStatusProps) {
  const badgeStyle = STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeStyle}`}>
        {status}
      </span>
      {qualified && (
        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 rounded" title="Verified Qualified Demand">
          ★ QUALIFIED
        </span>
      )}
    </div>
  );
}
