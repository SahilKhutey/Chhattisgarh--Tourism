"use client";

import React, { useEffect, useState } from "react";
import { JTBDCard, JTBDData } from "@/components/market-validation/JTBDCard";
import { ShieldCheck, Check, X } from "lucide-react";

export default function ValidationAdminPage() {
  const [jtbds, setJtbds] = useState<JTBDData[]>([]);
  const [activeModal, setActiveModal] = useState<{
    action: "support" | "invalidate";
    jtbd: JTBDData;
  } | null>(null);
  const [rationale, setRationale] = useState("");
  const [supportingCount, setSupportingCount] = useState(10);
  const [directBehaviorCount, setDirectBehaviorCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchJtbds = () => {
    fetch("/api/v1/market-validation/jobs", {
      headers: {
        "X-User-Role": "MARKET_RESEARCHER",
      },
    })
      .then((res) => res.json())
      .then((data) => setJtbds(data.items || []));
  };

  useEffect(() => {
    fetchJtbds();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    if (!rationale.trim()) {
      setActionError("Rationale is required for validation audit log.");
      return;
    }

    setLoading(true);
    setActionError(null);

    const endpoint = `/api/v1/market-validation/validation/${activeModal.jtbd.id}/${activeModal.action}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": "MARKET_RESEARCHER",
        },
        body: JSON.stringify({
          rationale,
          supporting_interviews_count:
            activeModal.action === "support" ? supportingCount : undefined,
          direct_behavior_count:
            activeModal.action === "support" ? directBehaviorCount : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Validation action failed");
      }

      setActiveModal(null);
      setRationale("");
      fetchJtbds();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Governance & Gates
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Market Validation Decision Scorecard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Promoting or invalidating core JTBD hypotheses based on empirical interview evidence.
        </p>
      </div>

      {activeModal && (
        <form
          onSubmit={handleDecisionSubmit}
          className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4 max-w-lg mx-auto shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-slate-100">
              {activeModal.action === "support" ? "Support" : "Invalidate"}{" "}
              {activeModal.jtbd.jtbd_key}
            </h2>
            <span className="text-xs font-mono text-slate-400">Audit Gate</span>
          </div>

          {actionError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg">
              {actionError}
            </div>
          )}

          <div className="text-xs space-y-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Decision Rationale (Mandatory)
              </label>
              <textarea
                required
                rows={3}
                placeholder="State the observed empirical proof or counter-evidence..."
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            {activeModal.action === "support" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Supporting Interviews
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={supportingCount}
                    onChange={(e) => setSupportingCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Direct Behaviors Observed
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={directBehaviorCount}
                    onChange={(e) => setDirectBehaviorCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs ${
                activeModal.action === "support"
                  ? "bg-teal-500 hover:bg-teal-400 text-slate-950"
                  : "bg-rose-500 hover:bg-rose-400 text-white"
              }`}
            >
              {loading ? "Recording..." : `Confirm ${activeModal.action}`}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jtbds.map((j) => (
          <JTBDCard
            key={j.id}
            jtbd={j}
            onSupport={(item) => setActiveModal({ action: "support", jtbd: item })}
            onInvalidate={(item) => setActiveModal({ action: "invalidate", jtbd: item })}
          />
        ))}
      </div>
    </div>
  );
}
