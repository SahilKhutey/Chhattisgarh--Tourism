"use client";

import React, { useEffect, useState } from "react";
import { ProviderTable, ProviderItem } from "@/components/market-validation/ProviderTable";
import { ProviderSegmentFilter } from "@/components/market-validation/ProviderSegmentFilter";
import { ProviderProfile } from "@/components/market-validation/ProviderProfile";
import { Plus, Building2 } from "lucide-react";

export default function ProvidersAdminPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [selectedSegment, setSelectedSegment] = useState("ALL");
  const [selectedGeography, setSelectedGeography] = useState("ALL");
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // New provider form state
  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState("HOMESTAY");
  const [segment, setSegment] = useState("MICRO_BUSINESS");
  const [geography, setGeography] = useState("BASTAR");
  const [operatingArea, setOperatingArea] = useState("");
  const [willingnessToPay, setWillingnessToPay] = useState("COMMISSION");

  const fetchProviders = () => {
    setLoading(true);
    let url = "/api/v1/market-validation/providers?";
    if (selectedSegment !== "ALL") url += `segment=${selectedSegment}&`;
    if (selectedGeography !== "ALL") url += `geography=${selectedGeography}&`;

    fetch(url, {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setProviders(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setProviders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedSegment, selectedGeography]);

  const handleCreateProvider = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/v1/market-validation/providers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({
        business_name: businessName,
        provider_type: providerType,
        segment: segment,
        geography: geography,
        operating_area: operatingArea,
        willingness_to_pay: willingnessToPay,
        willingness_to_participate: true,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to register provider");
        return res.json();
      })
      .then(() => {
        setShowAddForm(false);
        setBusinessName("");
        setOperatingArea("");
        fetchProviders();
      })
      .catch((err) => alert(err.message));
  };

  const handleStartOnboarding = (providerId: string) => {
    fetch(`/api/v1/market-validation/onboarding/${providerId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then(() => {
        fetchProviders();
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Supply Validation • MV3
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Tourism Experience Providers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of local homestays, guides, artisans, and tour operators participating in supply experiments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register Provider</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateProvider} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100">Register New Provider</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business Name</label>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Bastar Tribal Homestay"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Provider Type</label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              >
                <option value="HOMESTAY">Homestay</option>
                <option value="LOCAL_GUIDE">Local Guide</option>
                <option value="ARTISAN">Artisan / Craft</option>
                <option value="TOUR_OPERATOR">Tour Operator</option>
                <option value="TAXI">Taxi / Transport</option>
                <option value="RESTAURANT">Local Food Experience</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="MICRO_BUSINESS">Micro Business (&lt;5)</option>
                <option value="SMALL_BUSINESS">Small Business (5-20)</option>
                <option value="COMMUNITY">Community / Cooperative</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Geography Region</label>
              <select
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              >
                <option value="BASTAR">Bastar</option>
                <option value="SURGUJA">Surguja</option>
                <option value="RAIPUR">Raipur</option>
                <option value="BILASPUR">Bilaspur</option>
                <option value="DURG">Durg</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Operating Town / Area</label>
              <input
                required
                value={operatingArea}
                onChange={(e) => setOperatingArea(e.target.value)}
                placeholder="e.g. Tokapal, Jagdalpur"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Willingness to Pay</label>
              <select
                value={willingnessToPay}
                onChange={(e) => setWillingnessToPay(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
              >
                <option value="COMMISSION">Pay per verified booking (Commission)</option>
                <option value="SUBSCRIPTION">Monthly Subscription</option>
                <option value="UNDECIDED">Undecided / Needs Proof</option>
                <option value="NO">Unwilling to Pay</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-500"
            >
              Save Provider
            </button>
          </div>
        </form>
      )}

      {selectedProvider && (
        <div className="mb-4">
          <ProviderProfile
            provider={selectedProvider}
            onRecordResearch={() => alert("Open field research recorder")}
            onStartExperiment={() => alert("Open listing experiment builder")}
          />
        </div>
      )}

      <ProviderSegmentFilter
        selectedSegment={selectedSegment}
        selectedGeography={selectedGeography}
        onSelectSegment={setSelectedSegment}
        onSelectGeography={setSelectedGeography}
      />

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading providers...</div>
      ) : (
        <ProviderTable
          providers={providers}
          onSelectProvider={(p) => setSelectedProvider(p)}
          onStartOnboarding={handleStartOnboarding}
        />
      )}
    </div>
  );
}
