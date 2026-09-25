"use client";

import React, { useEffect, useState } from "react";
import { ProviderOnboarding, OnboardingData } from "@/components/market-validation/ProviderOnboarding";

export default function OnboardingAdminPage() {
  const [onboardings, setOnboardings] = useState<OnboardingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnboardings = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/onboarding", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setOnboardings(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setOnboardings([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const handleAdvanceStep = (providerId: string, nextStep: number) => {
    fetch(`/api/v1/market-validation/onboarding/${providerId}/step`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ step: nextStep, required_fields_completed: true }),
    })
      .then((res) => res.json())
      .then(() => fetchOnboardings())
      .catch((err) => alert(err.message));
  };

  const handleComplete = (providerId: string) => {
    fetch(`/api/v1/market-validation/onboarding/${providerId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({ required_fields_completed: true, activate_provider: true }),
    })
      .then((res) => res.json())
      .then(() => fetchOnboardings())
      .catch((err) => alert(err.message));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Friction Validation • MV3
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Provider Onboarding Experiments
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Measure provider drop-off across 7 steps, required fields completion, and time to activation.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading onboarding pipelines...</div>
      ) : onboardings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No onboarding runs active. Start an onboarding flow from the Providers directory.
        </div>
      ) : (
        <div className="space-y-4">
          {onboardings.map((onb) => (
            <ProviderOnboarding
              key={onb.id}
              onboarding={onb}
              onAdvanceStep={(s) => handleAdvanceStep(onb.provider_id, s)}
              onComplete={() => handleComplete(onb.provider_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
