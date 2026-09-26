import React from "react";

export interface TransactionStatusProps {
  transactionId: string;
  status: "INITIATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED" | string;
  amount: number;
  providerName: string;
  consumerName?: string;
  settlementModel?: string;
  experienceDate: string;
  verificationMethod?: string;
  cancellationReason?: string;
  onComplete?: (txId: string) => void;
  onCancel?: (txId: string) => void;
}

const BADGES: Record<string, { bg: string; text: string; label: string }> = {
  INITIATED: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Initiated" },
  IN_PROGRESS: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "In Progress" },
  COMPLETED: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Experience Completed" },
  CANCELLED: { bg: "bg-slate-100 border-slate-200", text: "text-slate-700", label: "Cancelled" },
  DISPUTED: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", label: "Disputed" },
};

export function TransactionStatus({
  transactionId,
  status,
  amount,
  providerName,
  consumerName = "Traveler",
  settlementModel = "DIRECT_TO_PROVIDER",
  experienceDate,
  verificationMethod = "TRAVELER_CONFIRMED",
  cancellationReason,
  onComplete,
  onCancel,
}: TransactionStatusProps) {
  const badge = BADGES[status] || {
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-700",
    label: status,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Transaction ID</span>
          <p className="text-sm font-semibold text-slate-900">{transactionId.slice(0, 16)}...</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div>
          <span className="text-slate-500">Provider</span>
          <p className="font-medium text-slate-800">{providerName}</p>
        </div>
        <div>
          <span className="text-slate-500">Customer</span>
          <p className="font-medium text-slate-800">{consumerName}</p>
        </div>
        <div>
          <span className="text-slate-500">Experience Date</span>
          <p className="font-medium text-slate-800">{experienceDate}</p>
        </div>
        <div>
          <span className="text-slate-500">Settlement</span>
          <p className="font-medium text-slate-800">{settlementModel.replace(/_/g, " ")}</p>
        </div>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3 mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-900">Gross Facilitated Value (GTV)</span>
        <span className="text-base font-bold text-emerald-700">₹{amount.toLocaleString("en-IN")}</span>
      </div>

      {cancellationReason && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5 mb-3">
          <span className="font-semibold">Reason: </span>{cancellationReason}
        </div>
      )}

      {status === "IN_PROGRESS" && onComplete && (
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={() => onCancel(transactionId)}
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => onComplete(transactionId)}
            className="px-4 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
          >
            Mark Completed
          </button>
        </div>
      )}
    </div>
  );
}
