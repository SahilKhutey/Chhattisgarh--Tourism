import React from "react";

export interface BookingSummaryProps {
  intentId: string;
  status: "SUBMITTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | string;
  providerName?: string;
  destination?: string;
  experience?: string;
  travelDate: string;
  endDate?: string;
  partySize: number;
  estimatedAmount?: number;
  paymentPreference?: string;
  confirmedAt?: string;
  cancellationReason?: string;
  onConfirm?: (intentId: string) => void;
  onCancel?: (intentId: string, reason: string) => void;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  SUBMITTED: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Intent Submitted" },
  CONFIRMED: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Host Confirmed" },
  COMPLETED: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "Trip Completed" },
  CANCELLED: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", label: "Cancelled" },
};

export function BookingSummary({
  intentId,
  status,
  providerName = "Local Homestay Host",
  destination = "Bastar",
  experience = "Tribal Village Immersion",
  travelDate,
  endDate,
  partySize,
  estimatedAmount = 3500,
  paymentPreference = "PAY_ON_ARRIVAL",
  confirmedAt,
  cancellationReason,
  onConfirm,
  onCancel,
}: BookingSummaryProps) {
  const badge = STATUS_BADGES[status] || {
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-700",
    label: status,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Booking Reference</span>
          <h4 className="text-base font-semibold text-slate-900">{intentId.slice(0, 13)}</h4>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500">Destination</p>
          <p className="text-sm font-medium text-slate-900">{destination}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Provider</p>
          <p className="text-sm font-medium text-slate-900">{providerName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Dates</p>
          <p className="text-sm font-medium text-slate-900">
            {travelDate} {endDate ? `→ ${endDate}` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Party Size</p>
          <p className="text-sm font-medium text-slate-900">{partySize} {partySize === 1 ? "Person" : "Persons"}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Facilitated Value (GTV)</p>
          <p className="text-lg font-bold text-slate-900">₹{estimatedAmount.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-semibold">Payment Method</p>
          <p className="text-xs font-medium text-slate-700">{paymentPreference.replace(/_/g, " ")}</p>
        </div>
      </div>

      {cancellationReason && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3 mb-4">
          <span className="font-semibold">Cancellation Reason: </span>
          {cancellationReason}
        </div>
      )}

      {status === "SUBMITTED" && onConfirm && (
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={() => onCancel(intentId, "User requested cancellation")}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
            >
              Cancel Booking
            </button>
          )}
          <button
            type="button"
            onClick={() => onConfirm(intentId)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
