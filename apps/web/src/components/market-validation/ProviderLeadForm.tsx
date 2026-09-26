import React, { useState } from "react";

export interface LeadFormData {
  provider_id: string;
  source: string;
  destination: string;
  experience: string;
  request_type: string;
  traveler_count: number;
  requested_date?: string;
  budget_band?: string;
  message?: string;
  traveler_segment?: string;
}

export interface ProviderLeadFormProps {
  providerId: string;
  destinationName?: string;
  experienceName?: string;
  onSubmit: (data: LeadFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ProviderLeadForm({
  providerId,
  destinationName = "Bastar",
  experienceName = "Local Guided Experience",
  onSubmit,
  onCancel,
  isLoading = false,
}: ProviderLeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    provider_id: providerId,
    source: "DESTINATION",
    destination: destinationName,
    experience: experienceName,
    request_type: "BOOKING_INQUIRY",
    traveler_count: 2,
    requested_date: "",
    budget_band: "MODERATE",
    message: "",
    traveler_segment: "ECO_TOURIST",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Inquire with Provider</h3>
      <p className="text-sm text-slate-500 mb-4">
        Direct connection with vetted local tourism operators in Chhattisgarh.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Destination & Experience
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="Destination"
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              required
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Experience / Activity"
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Travelers
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={formData.traveler_count}
              onChange={(e) => setFormData({ ...formData, traveler_count: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.requested_date}
              onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Inquiry Type
            </label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="BOOKING_INQUIRY">Booking Inquiry</option>
              <option value="AVAILABILITY_CHECK">Check Availability</option>
              <option value="CUSTOM_ITINERARY">Custom Itinerary</option>
              <option value="PRICE_QUOTE">Price Quote</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Budget Band
            </label>
            <select
              value={formData.budget_band}
              onChange={(e) => setFormData({ ...formData, budget_band: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="BUDGET">Budget (&lt; ₹1,500/day)</option>
              <option value="MODERATE">Moderate (₹1,500 - ₹4,000/day)</option>
              <option value="PREMIUM">Premium (&gt; ₹4,000/day)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Message or Specific Questions
          </label>
          <textarea
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell the provider your preferred timing, requirements, or dietary preferences..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {isLoading ? "Submitting..." : "Send Inquiry"}
          </button>
        </div>
      </div>
    </form>
  );
}
