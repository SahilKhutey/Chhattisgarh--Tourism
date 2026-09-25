"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, ThumbsUp, AlertCircle, Smile, Frown } from "lucide-react";

export default function ProviderFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/market-validation/provider-feedback", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setFeedbackList(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setFeedbackList([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Voice of Provider • MV3
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Provider Feedback & Sentiment
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Qualitative feedback from local experience hosts, homestays, and guides on tools and demand quality.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading provider feedback...</div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No feedback entries recorded yet. Record feedback from the Provider profile after a lead interaction.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((fb) => (
            <div key={fb.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {fb.journey} • {fb.feature}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">Difficulty Rating: {fb.difficulty} / 5</div>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    fb.sentiment === "POSITIVE" || fb.sentiment === "DELIGHTED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {fb.sentiment}
                </span>
              </div>

              {fb.value && (
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80 text-xs">
                  <div className="font-semibold text-emerald-400 mb-0.5">Observed Value</div>
                  <div className="text-slate-300">{fb.value}</div>
                </div>
              )}

              {fb.problem && (
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80 text-xs">
                  <div className="font-semibold text-rose-400 mb-0.5">Reported Friction</div>
                  <div className="text-slate-300">{fb.problem}</div>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <div>
                  Willing to continue:{" "}
                  <strong className={fb.willingness_to_continue ? "text-emerald-400" : "text-rose-400"}>
                    {fb.willingness_to_continue ? "Yes" : "No"}
                  </strong>
                </div>
                <div>{fb.willingness_to_pay ? `WTP: ${fb.willingness_to_pay}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
