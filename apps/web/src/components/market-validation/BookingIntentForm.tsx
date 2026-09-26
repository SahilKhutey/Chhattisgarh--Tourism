import React, { useState } from "react";

export interface BookingIntentData {
  provider_id: string;
  lead_id?: string;
  destination_id?: string;
  experience_id?: string;
  party_size: number;
  travel_date: string;
  end_date?: string;
  price_band?: string;
  estimated_amount?: number;
  payment_preference: string;
  special_requests?: string;
  idempotency_key?: string;
}

export interface BookingIntentFormProps {
  providerId: string;
  leadId?: string;
  destinationId?: string;
  experienceId?: string;
  estimatedAmount?: number;
  onSubmit: (data: BookingIntentData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function BookingIntentForm({
  providerId,
  leadId,
  destinationId,
  experienceId,
  estimatedAmount = 3500,
  onSubmit,
  onCancel,
  isLoading = false,
}: BookingIntentFormProps) {
  const [formData, setFormData] = useState<BookingIntentData>({
    provider_id: providerId,
    lead_id: leadId,
    destination_id: destinationId,
    experience_id: experienceId,
    party_size: 2,
    travel_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    price_band: "STANDARD",
    estimated_amount: estimatedAmount,
    payment_preference: "PAY_ON_ARRIVAL",
    special_requests: "",
    idempotency_key: `intent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Express Booking Intent</h3>
          <p className="text-xs text-slate-500">
            Validated assisted transaction without pre-payment commitment.
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          MV7 Assisted
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Party Size
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={formData.party_size}
              onChange={(e) =>
                setFormData({ ...formData, party_size: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Estimated Total (₹)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.estimated_amount}
              onChange={(e) =>
                setFormData({ ...formData, estimated_amount: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Arrival Date
            </label>
            <input
              type="date"
              required
              value={formData.travel_date}
              onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Departure Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Payment Preference
          </label>
          <select
            value={formData.payment_preference}
            onChange={(e) => setFormData({ ...formData, payment_preference: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="PAY_ON_ARRIVAL">Pay on Arrival (Cash / Local UPI)</option>
            <option value="UPI_ADVANCE">Direct UPI Advance to Host</option>
            <option value="BANK_TRANSFER">Direct Bank Transfer</option>
            <option value="ASSISTED_CONCIERGE">Assisted Concierge Facilitation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Special Instructions / Dietary Needs
          </label>
          <textarea
            rows={2}
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            placeholder="Local food preferences, pickup request, guide requirements..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-0.5">Zero Platform Commission During Validation</p>
          <p>
            100% of your booking amount goes directly to the local host and guide.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {isLoading ? "Submitting Intent..." : "Submit Booking Intent"}
          </button>
        </div>
      </form>
    </div>
  );
}
