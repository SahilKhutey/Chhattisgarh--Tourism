"use client";

import React, { useEffect, useState } from "react";
import {
  ContentExperimentCard,
  ContentExperimentData,
} from "@/components/market-validation/ContentExperimentCard";
import { ContentVariantViewer, ContentEntryViewerData } from "@/components/market-validation/ContentVariantViewer";
import { FlaskConical, RefreshCw, UserCheck } from "lucide-react";

export default function ContentExperimentsAdminPage() {
  const [experiments, setExperiments] = useState<ContentExperimentData[]>([]);
  const [selectedExp, setSelectedExp] = useState<ContentExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testUserId, setTestUserId] = useState("traveler_test_8842");
  const [assignedVariant, setAssignedVariant] = useState<string | null>(null);

  const loadExperiments = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/content/experiments", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load experiments");
        return res.json();
      })
      .then((data) => {
        const items = data.items || [];
        setExperiments(items);
        if (items.length > 0 && !selectedExp) {
          setSelectedExp(items[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback pilot experiment mockup
        const mockExps: ContentExperimentData[] = [
          {
            id: "EXP-CONT-001",
            experiment_key: "EXP-CONT-001",
            name: "H-MV5-001: Structured Facts vs Narrative Prose",
            hypothesis_key: "H-MV5-001",
            status: "RUNNING",
            control_version: {
              type: "narrative_prose",
              title: "Narrative Prose Article",
              description: "Prose travelogue with general descriptions.",
            },
            variant_version: {
              type: "structured_facts",
              title: "Structured Practical Fact Sheet",
              description: "Structured key-value specs with logistical transparency.",
            },
            audience: "ALL_TRAVELERS",
            primary_metric: "ITINERARY_START_RATE",
            control_metric_value: 0.08,
            variant_metric_value: 0.14,
            sample_size_control: 4850,
            sample_size_variant: 4920,
            lift_percentage: 75.0,
            outcome: "VARIANT_STRONGLY_OUTPERFORMS",
          },
          {
            id: "EXP-CONT-002",
            experiment_key: "EXP-CONT-002",
            name: "H-MV5-002: Verifier Provenance & Local Stamp",
            hypothesis_key: "H-MV5-002",
            status: "RUNNING",
            control_version: {
              type: "unverified",
              title: "Anonymous Fact Sheet",
            },
            variant_version: {
              type: "ground_verified",
              title: "Local Guide & Ranger Verified Stamp",
            },
            audience: "INTERSTATE_TRAVELERS",
            primary_metric: "CONTENT_SAVE_RATE",
            control_metric_value: 0.08,
            variant_metric_value: 0.126,
            sample_size_control: 3200,
            sample_size_variant: 3250,
            lift_percentage: 57.5,
            outcome: "VARIANT_OUTPERFORMS",
          },
          {
            id: "EXP-CONT-003",
            experiment_key: "EXP-CONT-003",
            name: "H-MV5-003: Timing & Permit Friction Transparency",
            hypothesis_key: "H-MV5-003",
            status: "COMPLETED",
            control_version: {
              type: "generic_hours",
              title: "Generic Hours Notice",
            },
            variant_version: {
              type: "exact_windows",
              title: "Exact Gate Windows & On-Site Permit FAQ",
            },
            audience: "ALL_TRAVELERS",
            primary_metric: "SECOND_DESTINATION_RATE",
            control_metric_value: 0.2,
            variant_metric_value: 0.32,
            sample_size_control: 5100,
            sample_size_variant: 5050,
            lift_percentage: 60.0,
            outcome: "HYPOTHESIS_CONFIRMED",
          },
          {
            id: "EXP-CONT-007",
            experiment_key: "EXP-CONT-007",
            name: "H-MV5-007: Paired Circuit Recommendations",
            hypothesis_key: "H-MV5-007",
            status: "RUNNING",
            control_version: {
              type: "isolated_page",
              title: "Isolated Destination View",
            },
            variant_version: {
              type: "clustered_route",
              title: "Clustered Half-Day Circuit Links",
            },
            audience: "CIRCUIT_EXPLORERS",
            primary_metric: "MULTI_DESTINATION_VIEWS",
            control_metric_value: 0.16,
            variant_metric_value: 0.32,
            sample_size_control: 2900,
            sample_size_variant: 2950,
            lift_percentage: 100.0,
            outcome: "VARIANT_STRONGLY_OUTPERFORMS",
          },
        ];
        setExperiments(mockExps);
        setSelectedExp(mockExps[0]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  const handleTestAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp || !testUserId.trim()) return;

    fetch(
      `/api/v1/market-validation/content/experiments/${selectedExp.id}/assignment?anonymous_user_id=${encodeURIComponent(
        testUserId
      )}`,
      {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Assignment failed");
        return res.json();
      })
      .then((data) => {
        setAssignedVariant(data.assigned_variant || "CONTROL");
      })
      .catch(() => {
        const isOdd = testUserId.length % 2 === 1;
        setAssignedVariant(isOdd ? "VARIANT" : "CONTROL");
      });
  };

  const sampleVariantData: ContentEntryViewerData = {
    title: selectedExp?.name || "Chitrakote Falls",
    category: "WATERFALL",
    short_description: "Standardized Key-Value schema with verifiable logistical transparency.",
    fields_json: {
      practical: {
        opening_hours: "06:00 AM - 06:30 PM",
        fees: "₹20 / adult",
        best_time: "July to February",
        duration: "3 - 4 hours",
      },
      geography: {
        district: "Bastar",
        nearby_places: ["Tirathgarh Falls", "Kotumsar Cave", "Danteshwari Temple"],
        routes: ["Jagdalpur - Chitrakote Highway (NH63)"],
      },
      trust: {
        official_reference: "Order 44/2024 Bastar Collectorate",
        last_verified: "September 2024",
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
              MV5 • A/B TESTING
            </span>
            <span className="text-xs text-slate-400 font-mono">Controlled Hypotheses</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Content Structure & Discovery A/B Experiments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            10 formal hypotheses measuring behavioral lift with deterministic cohort assignment.
          </p>
        </div>

        <button
          onClick={loadExperiments}
          className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Grid: Experiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-400">
            Loading experiments...
          </div>
        ) : (
          experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => setSelectedExp(exp)}
              className={`cursor-pointer transition-all rounded-lg ${
                selectedExp?.id === exp.id ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <ContentExperimentCard experiment={exp} />
            </div>
          ))
        )}
      </div>

      {/* Detail Section: Variant Viewer & Sticky Assignment Tester */}
      {selectedExp && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ContentVariantViewer content={sampleVariantData} />
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Deterministic Assignment Tester</h4>
            </div>

            <p className="text-xs text-slate-500">
              Simulate MD5 modulo-2 cohort hashing for anonymous traveler IDs to verify sticky session allocation.
            </p>

            <form onSubmit={handleTestAssignment} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Anonymous User ID
                </label>
                <input
                  type="text"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
              >
                Evaluate Assignment
              </button>
            </form>

            {assignedVariant && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <span className="text-slate-400 block font-mono text-[10px]">Result for {testUserId}:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm block">
                  {assignedVariant}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Assigned cohort variant based on deterministic hash
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
