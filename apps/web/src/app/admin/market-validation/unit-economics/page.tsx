"use client";

import React, { useEffect, useState } from "react";
import { UnitEconomicsTable, UnitEconomicsRow } from "@/components/market-validation/UnitEconomicsTable";
import { ContributionMarginCard } from "@/components/market-validation/ContributionMarginCard";

export default function UnitEconomicsAdminPage() {
  const [records, setRecords] = useState<UnitEconomicsRow[]>([]);
  const [blendedLtvCac, setBlendedLtvCac] = useState(7.64);
  const [isViable, setIsViable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/business/unit-economics/overview", {
      headers: { "X-User-Role": "FINANCE_ADMIN" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
        if (data.blended_ltv_cac) setBlendedLtvCac(data.blended_ltv_cac);
        if (data.is_economically_viable !== undefined) setIsViable(data.is_economically_viable);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Financial Sustainability • MV9
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Unit Economics &amp; LTV/CAC Viability
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous analysis of Customer Acquisition Cost, Payback Velocity, and Lifetime Value across provider and consumer loops.
        </p>
      </div>

      <UnitEconomicsTable
        records={records.length > 0 ? records : undefined}
        blendedLtvCac={blendedLtvCac}
        isViable={isViable}
      />

      <ContributionMarginCard />
    </div>
  );
}
