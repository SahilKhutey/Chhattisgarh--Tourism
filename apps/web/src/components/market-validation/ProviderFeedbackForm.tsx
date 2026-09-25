import React, { useState } from "react";

export interface ProviderFeedbackData {
  provider_id: string;
  journey: string;
  feature: string;
  sentiment: string;
  difficulty: number;
  problem?: string;
  value?: string;
  willingness_to_continue: boolean;
  willingness_to_pay?: string;
}

export interface ProviderFeedbackFormProps {
  providerId: string;
  onSubmit: (data: ProviderFeedbackData) => void;
}

export function ProviderFeedbackForm({ providerId, onSubmit }: ProviderFeedbackFormProps) {
  const [journey, setJourney] = useState("LEAD_RECEIPT");
  const [feature, setFeature] = useState("WHATSAPP_LINK");
  const [sentiment, setSentiment] = useState("POSITIVE");
  const [difficulty, setDifficulty] = useState(2);
  const [value, setValue] = useState("");
  const [problem, setProblem] = useState("");
  const [willingnessToContinue, setWillingnessToContinue] = useState(true);
  const [willingnessToPay, setWillingnessToPay] = useState("COMMISSION_5_TO_10_PCT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      provider_id: providerId,
      journey,
      feature,
      sentiment,
      difficulty,
      problem: problem || undefined,
      value: value || undefined,
      willingness_to_continue: willingnessToContinue,
      willingness_to_pay: willingnessToPay,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 mb-2">Record Provider Feedback</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Journey Stage</label>
          <select
            value={journey}
            onChange={(e) => setJourney(e.target.value)}
            className="w-full text-sm border-slate-300 rounded bg-slate-50 px-3 py-2"
          >
            <option value="ONBOARDING">Onboarding</option>
            <option value="LISTING_CREATION">Listing Creation</option>
            <option value="LEAD_RECEIPT">Lead Receipt & Notification</option>
            <option value="TOURIST_COMMUNICATION">Tourist Communication</option>
            <option value="BOOKING_MANAGEMENT">Booking Management</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sentiment</label>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="w-full text-sm border-slate-300 rounded bg-slate-50 px-3 py-2"
          >
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
            <option value="DELIGHTED">Delighted</option>
            <option value="FRUSTRATED">Frustrated</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
          Ease of Use (1 = Very Easy, 5 = Very Difficult): {difficulty}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">What Value Did the Provider Experience?</label>
        <textarea
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Received a verified customer without running paid ads"
          className="w-full text-sm border-slate-300 rounded bg-slate-50 p-2"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Friction or Unmet Expectation</label>
        <textarea
          rows={2}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g. Tourist asked for AC in summer, homestay is natural ventilation only"
          className="w-full text-sm border-slate-300 rounded bg-slate-50 p-2"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={willingnessToContinue}
            onChange={(e) => setWillingnessToContinue(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          Willing to receive more traveler leads
        </label>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          Submit Feedback
        </button>
      </div>
    </form>
  );
}
