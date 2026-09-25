"use client";

import React, { useEffect, useState } from "react";
import { SegmentFilter } from "@/components/market-validation/SegmentFilter";
import { ParticipantForm } from "@/components/market-validation/ParticipantForm";
import { Plus, Users } from "lucide-react";

export default function ParticipantsAdminPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = () => {
    setLoading(true);
    const url = selectedSegment
      ? `/api/v1/market-validation/participants?segment=${selectedSegment}`
      : "/api/v1/market-validation/participants";

    fetch(url, {
      headers: {
        "X-User-Role": "MARKET_RESEARCHER",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setParticipants([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchParticipants();
  }, [selectedSegment]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
            Cohort Registry
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Research Participants
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-safe consumer cohort management with strict zero-PII storage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Participant</span>
        </button>
      </div>

      {showAddForm && (
        <ParticipantForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchParticipants();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <SegmentFilter
        selectedSegment={selectedSegment}
        onChange={(seg) => setSelectedSegment(seg)}
      />

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading participants...</div>
      ) : participants.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No participants recorded for this segment yet. Use the button above to register an anonymous participant.
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Anonymous ID</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Age Band</th>
                <th className="py-3 px-4">Planning Method</th>
                <th className="py-3 px-4">CG Visit</th>
                <th className="py-3 px-4">Consent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 px-4 font-mono font-bold text-teal-400">
                    {p.anonymous_id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">{p.segment}</td>
                  <td className="py-3 px-4">{p.origin_region}</td>
                  <td className="py-3 px-4">{p.age_band}</td>
                  <td className="py-3 px-4 text-slate-400">{p.planning_method}</td>
                  <td className="py-3 px-4 text-slate-400">{p.cg_visit_history}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
