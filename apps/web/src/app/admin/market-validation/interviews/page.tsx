"use client";

import React, { useEffect, useState } from "react";
import { InterviewTimeline } from "@/components/market-validation/InterviewTimeline";
import { InterviewForm } from "@/components/market-validation/InterviewForm";
import { Plus, Video, Calendar, Clock } from "lucide-react";

export default function InterviewsAdminPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/interviews", {
      headers: {
        "X-User-Role": "MARKET_RESEARCHER",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setInterviews(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setInterviews([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
            Behavioral Observations
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Research Interviews
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Task-based interviews tracking traveler friction, live tool usage, and workarounds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Interview</span>
        </button>
      </div>

      {showAddForm && (
        <InterviewForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchInterviews();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No interviews conducted yet. Click above to record a new behavioral session.
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-mono text-xs font-bold">
                    📍 {item.destination || "General Chhattisgarh"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Interviewer: <strong className="text-slate-200">{item.interviewer}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    {item.duration_minutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <InterviewTimeline currentStatus={item.transcript_status} />

              {item.summary && (
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Session Summary:</strong>
                  {item.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
