"use client";

import React, { useState } from "react";

interface InterviewFormProps {
  participantId?: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function InterviewForm({ participantId, onSuccess, onCancel }: InterviewFormProps) {
  const [partId, setPartId] = useState(participantId || "");
  const [interviewer, setInterviewer] = useState("Research Team");
  const [duration, setDuration] = useState(45);
  const [destination, setDestination] = useState("Bastar Cultural Corridor");
  const [transcriptStatus, setTranscriptStatus] = useState("CONDUCTED");
  const [recordingConsent, setRecordingConsent] = useState(true);
  const [travelContext, setTravelContext] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId) {
      setError("Participant ID is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/market-validation/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": "MARKET_RESEARCHER",
        },
        body: JSON.stringify({
          participant_id: partId,
          research_project: "CG_TOURISM_MV2",
          interviewer,
          date: new Date().toISOString(),
          duration_minutes: Number(duration),
          destination,
          transcript_status: transcriptStatus,
          recording_consent: recordingConsent,
          travel_context: travelContext,
          summary,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to record interview");
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
          Record Consumer Behavioral Interview
        </h2>
        <span className="text-xs text-teal-400 font-mono">MV2 Protocol</span>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Participant UUID</label>
          <input
            type="text"
            required
            placeholder="Participant UUID"
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Interviewer Name</label>
          <input
            type="text"
            required
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Duration (Minutes)</label>
          <input
            type="number"
            min={5}
            max={480}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Target Destination / Corridor</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Interview Status</label>
          <select
            value={transcriptStatus}
            onChange={(e) => setTranscriptStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
          >
            <option value="PLANNED">Planned</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONDUCTED">Conducted</option>
            <option value="TRANSCRIBED">Transcribed</option>
            <option value="ANALYZED">Analyzed</option>
          </select>
        </div>

        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={recordingConsent}
              onChange={(e) => setRecordingConsent(e.target.checked)}
              className="rounded border-slate-700 text-teal-500"
            />
            Recording / Screen-share Consented
          </label>
        </div>
      </div>

      <div className="text-xs">
        <label className="block text-slate-400 font-medium mb-1">
          Travel Context & Live Task Observed
        </label>
        <textarea
          rows={2}
          placeholder="e.g. 3-day Bastar itinerary task starting from Raipur..."
          value={travelContext}
          onChange={(e) => setTravelContext(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
        />
      </div>

      <div className="text-xs">
        <label className="block text-slate-400 font-medium mb-1">
          Key Findings & Behavioral Observations
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Switched between 6 apps, spent 22 mins, abandoned due to unverified road safety after sunset."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
        />
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
          {loading ? "Saving..." : "Save Interview Record"}
        </button>
      </div>
    </form>
  );
}
