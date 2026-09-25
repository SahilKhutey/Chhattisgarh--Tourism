"use client";

import React, { useState } from "react";
import { CONSUMER_SEGMENTS } from "./SegmentFilter";

interface ParticipantFormProps {
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function ParticipantForm({ onSuccess, onCancel }: ParticipantFormProps) {
  const [segment, setSegment] = useState("INTERSTATE_TRAVELER");
  const [originRegion, setOriginRegion] = useState("");
  const [ageBand, setAgeBand] = useState("25-34");
  const [travelFrequency, setTravelFrequency] = useState("FREQUENT");
  const [cgVisitHistory, setCgVisitHistory] = useState("NEVER");
  const [planningMethod, setPlanningMethod] = useState("GOOGLE_SEARCH");
  const [recruitmentSource, setRecruitmentSource] = useState("COMMUNITY");
  const [consentStatus, setConsentStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentStatus) {
      setError("Participant must provide explicit informed consent.");
      return;
    }
    if (!originRegion.trim()) {
      setError("Origin region is required (e.g., Delhi, Bengaluru, Raipur).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/market-validation/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": "MARKET_RESEARCHER",
        },
        body: JSON.stringify({
          segment,
          traveler_type: [segment],
          origin_region: originRegion,
          age_band: ageBand,
          travel_frequency: travelFrequency,
          cg_visit_history: cgVisitHistory,
          planning_method: planningMethod,
          preferred_language: "en",
          recruitment_source: recruitmentSource,
          consent_status: consentStatus,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create participant");
      }

      const created = await res.json();
      onSuccess(created);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base font-semibold text-slate-100">
          Enlist Research Participant
        </h2>
        <span className="text-xs text-teal-400 font-mono">🔒 Zero-PII Protocol</span>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Consumer Segment</label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          >
            {CONSUMER_SEGMENTS.filter((s) => s.id !== "ALL").map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">
            Coarse Origin Region (City / State)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Bengaluru, Mumbai, Raipur"
            value={originRegion}
            onChange={(e) => setOriginRegion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Age Band</label>
          <select
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          >
            <option value="18-24">18–24</option>
            <option value="25-34">25–34</option>
            <option value="35-49">35–49</option>
            <option value="50+">50+</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Travel Frequency</label>
          <select
            value={travelFrequency}
            onChange={(e) => setTravelFrequency(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          >
            <option value="FREQUENT">Frequent (Monthly/Quarterly)</option>
            <option value="OCCASIONAL">Occasional (1-2 trips/year)</option>
            <option value="FIRST_TIME">First-Time Explorer</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">CG Visit History</label>
          <select
            value={cgVisitHistory}
            onChange={(e) => setCgVisitHistory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          >
            <option value="NEVER">Never Visited</option>
            <option value="ONCE">Visited Once</option>
            <option value="MULTIPLE">Multiple Visits</option>
            <option value="RESIDENT">Resident of Chhattisgarh</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Primary Planning Method</label>
          <select
            value={planningMethod}
            onChange={(e) => setPlanningMethod(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          >
            <option value="GOOGLE_SEARCH">Google Search + Maps</option>
            <option value="YOUTUBE">YouTube Vlogs</option>
            <option value="INSTAGRAM">Instagram Reels / Travel Creators</option>
            <option value="FRIENDS_AND_FAMILY">Friends & Word of Mouth</option>
            <option value="TRAVEL_AGENCY">Offline Tour Operator</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
        <input
          type="checkbox"
          id="consentCheck"
          checked={consentStatus}
          onChange={(e) => setConsentStatus(e.target.checked)}
          className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
        />
        <label htmlFor="consentCheck" className="text-xs text-slate-300">
          Participant has reviewed and granted explicit informed consent for anonymized research.
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-lg shadow-teal-500/20"
        >
          {loading ? "Registering..." : "Register Anonymous Participant"}
        </button>
      </div>
    </form>
  );
}
