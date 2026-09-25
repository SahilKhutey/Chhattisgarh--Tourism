"use client";

import React, { useEffect, useState } from "react";
import { JTBDCard, JTBDData } from "@/components/market-validation/JTBDCard";
import { CheckCircle2 } from "lucide-react";

export default function JobsAdminPage() {
  const [jtbds, setJtbds] = useState<JTBDData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJtbds = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/jobs", {
      headers: {
        "X-User-Role": "MARKET_RESEARCHER",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setJtbds(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setJtbds([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJtbds();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
          Core Value Proposition
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Jobs-To-Be-Done (JTBD)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          The 6 core jobs tourists hire CG Tourism OS to accomplish.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading jobs register...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jtbds.map((j) => (
            <JTBDCard key={j.id} jtbd={j} />
          ))}
        </div>
      )}
    </div>
  );
}
