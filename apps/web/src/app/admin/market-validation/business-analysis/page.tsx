"use client";

import React, { useEffect, useState } from "react";
import { BusinessInsights, GuardrailCheck } from "@/components/market-validation/BusinessInsights";

export default function BusinessAnalysisAdminPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/business/report", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Final Executive Verdict • MV9
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Executive Business Model Validation Report
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Synthesis across MV1–MV8 behavioral evidence, unit economics viability, and final Go/No-Go monetization graduation.
        </p>
      </div>

      <BusinessInsights
        primaryModel={report?.primary_business_model}
        monetizationStrategy={report?.monetization_strategy}
        sevfInr={report?.sustainable_economic_value_facilitated_inr}
        grossRevenueInr={report?.platform_gross_revenue_inr}
        netContributionInr={report?.platform_net_contribution_inr}
        contributionMarginPct={report?.blended_contribution_margin_pct}
        providerLtvCac={report?.provider_ltv_cac_ratio}
        providerPaybackMonths={report?.provider_payback_months}
        consumerLtvCac={report?.consumer_ltv_cac_ratio}
        trustRiskScore={report?.trust_risk_score}
        recommendation={report?.go_no_go_recommendation}
        guardrails={report?.guardrails}
        verdict={report?.strategic_verdict}
      />
    </div>
  );
}
