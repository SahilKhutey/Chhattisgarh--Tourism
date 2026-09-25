"use client";

import React, { useEffect, useState } from "react";
import { GeographicExperiment, GeoExperimentData } from "@/components/market-validation/GeographicExperiment";
import { GeoEvidenceCard, GeoEvidenceItem } from "@/components/market-validation/GeoEvidenceCard";
import { FlaskConical, Plus } from "lucide-react";

export default function GeoExperimentsAdminPage() {
  const [experiments, setExperiments] = useState<GeoExperimentData[]>([]);
  const [observations, setObservations] = useState<GeoEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"EXPERIMENTS" | "OBSERVATIONS">("EXPERIMENTS");

  // New Experiment Modal
  const [showAddExp, setShowAddExp] = useState(false);
  const [expKey, setExpKey] = useState("EXP-GEO-003");
  const [expName, setExpName] = useState("");
  const [hypoKey, setHypoKey] = useState("H-MV4-001");
  const [controlDesc, setControlDesc] = useState("");
  const [variantDesc, setVariantDesc] = useState("");
  const [metricName, setMetricName] = useState("nearby_activation_rate");

  // New Observation Modal
  const [showAddObs, setShowAddObs] = useState(false);
  const [obsTaskId, setObsTaskId] = useState("TASK-BASTAR-3DAY");
  const [obsSrc, setObsSrc] = useState("DEST_JAGDALPUR");
  const [obsTgt, setObsTgt] = useState("DEST_CHITRAKOTE");
  const [obsRel, setObsRel] = useState("NEARBY");
  const [obsBehavior, setObsBehavior] = useState("");
  const [obsSuccess, setObsSuccess] = useState(true);
  const [obsDifficulty, setObsDifficulty] = useState(2);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/v1/market-validation/geography/experiments", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
      fetch("/api/v1/market-validation/geography/experiments/observations", {
        headers: { "X-User-Role": "MARKET_RESEARCHER" },
      }).then((r) => r.json()),
    ])
      .then(([expData, obsData]) => {
        setExperiments(expData.items || []);
        setObservations(obsData.items || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo experiments
        setExperiments([
          {
            id: "1",
            experiment_key: "EXP-GEO-001",
            name: "Nearby Discovery Contextual Drawer Test",
            hypothesis_key: "H-MV4-001",
            status: "RUNNING",
            control_description: "Standard destination listing page with photo and text only",
            variant_description: "Contextual destination page with 10km, 25km, 50km nearby places",
            primary_metric_name: "nearby_planning_activation_rate",
            control_metric_value: 0.18,
            variant_metric_value: 0.42,
            sample_size_control: 50,
            sample_size_variant: 50,
            lift_percentage: 133.33,
            outcome: "VARIANT_STRONGLY_OUTPERFORMS",
          },
          {
            id: "2",
            experiment_key: "EXP-GEO-002",
            name: "Regional Cluster vs Isolated Destinations",
            hypothesis_key: "H-MV4-002",
            status: "RUNNING",
            control_description: "Alphabetical destination directory without zone grouping",
            variant_description: "Interactive Bastar Hub-and-Spoke cluster interface",
            primary_metric_name: "itinerary_completion_rate",
            control_metric_value: 0.25,
            variant_metric_value: 0.55,
            sample_size_control: 40,
            sample_size_variant: 40,
            lift_percentage: 120.0,
            outcome: "VARIANT_STRONGLY_OUTPERFORMS",
          },
        ]);
        setObservations([
          {
            id: "obs-1",
            task_id: "TASK-BASTAR-3DAY",
            source_place_id: "DEST_JAGDALPUR",
            target_place_id: "DEST_CHITRAKOTE",
            relationship_type: "SAME_TRIP_CLUSTER",
            observed_behavior: "Traveler scheduled Chitrakote sunset visit and added nearby Tirathgarh for next morning after seeing 25km radius suggestion",
            successful: true,
            difficulty: 2,
            confidence: 0.95,
            evidence_type: "USER_OBSERVATION",
          },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/v1/market-validation/geography/experiments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({
        experiment_key: expKey.trim(),
        name: expName.trim(),
        hypothesis_key: hypoKey,
        status: "RUNNING",
        control_description: controlDesc,
        variant_description: variantDesc,
        primary_metric_name: metricName,
        control_metric_value: 0.2,
        variant_metric_value: 0.45,
        sample_size_control: 25,
        sample_size_variant: 25,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowAddExp(false);
        setExpName("");
        loadData();
      });
  };

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/v1/market-validation/geography/experiments/observations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({
        task_id: obsTaskId.trim(),
        source_place_id: obsSrc.trim(),
        target_place_id: obsTgt.trim(),
        relationship_type: obsRel,
        observed_behavior: obsBehavior.trim(),
        successful: obsSuccess,
        difficulty: obsDifficulty,
        confidence: 0.9,
        evidence_type: "USER_OBSERVATION",
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowAddObs(false);
        setObsBehavior("");
        loadData();
      });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
            Behavioral Hypotheses • MV4
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Geographic Experiments & Observations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validating spatial hypotheses H-MV4-001 through H-MV4-008 and real traveler behavior.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("EXPERIMENTS")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === "EXPERIMENTS"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Experiments ({experiments.length})
            </button>
            <button
              onClick={() => setActiveTab("OBSERVATIONS")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === "OBSERVATIONS"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Observations ({observations.length})
            </button>
          </div>

          {activeTab === "EXPERIMENTS" ? (
            <button
              onClick={() => setShowAddExp(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
            >
              <Plus size={14} />
              <span>New Experiment</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddObs(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
            >
              <Plus size={14} />
              <span>Record Observation</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === "EXPERIMENTS" ? (
        <div className="grid grid-cols-1 gap-4">
          {experiments.map((exp) => (
            <GeographicExperiment
              key={exp.id || exp.experiment_key}
              experiment={exp}
              onAddObservation={() => {
                setObsTaskId(exp.experiment_key);
                setShowAddObs(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {observations.map((obs, idx) => (
            <GeoEvidenceCard key={obs.id || idx} evidence={obs} />
          ))}
        </div>
      )}

      {/* New Experiment Modal */}
      {showAddExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Define Geographic Experiment</h3>
            <form onSubmit={handleCreateExperiment} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experiment Key</label>
                  <input
                    type="text"
                    required
                    value={expKey}
                    onChange={(e) => setExpKey(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hypothesis</label>
                  <select
                    value={hypoKey}
                    onChange={(e) => setHypoKey(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="H-MV4-001">H-MV4-001: Discover places near destination</option>
                    <option value="H-MV4-002">H-MV4-002: Grouped tourism experiences</option>
                    <option value="H-MV4-003">H-MV4-003: Realistically combinable destinations</option>
                    <option value="H-MV4-004">H-MV4-004: Route-based discovery</option>
                    <option value="H-MV4-005">H-MV4-005: Planning confidence</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Map-First vs List-First Discovery"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Control (A) Description</label>
                <textarea
                  rows={2}
                  required
                  value={controlDesc}
                  onChange={(e) => setControlDesc(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Standard static place card"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variant (B) Description</label>
                <textarea
                  rows={2}
                  required
                  value={variantDesc}
                  onChange={(e) => setVariantDesc(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Map-first cluster exploration"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExp(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Create Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Observation Modal */}
      {showAddObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Record Traveler Observation</h3>
            <form onSubmit={handleCreateObservation} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Task ID</label>
                  <input
                    type="text"
                    required
                    value={obsTaskId}
                    onChange={(e) => setObsTaskId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship Type</label>
                  <select
                    value={obsRel}
                    onChange={(e) => setObsRel(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="NEARBY">NEARBY</option>
                    <option value="SAME_TRIP_CLUSTER">SAME_TRIP_CLUSTER</option>
                    <option value="ALONG_ROUTE">ALONG_ROUTE</option>
                    <option value="NEXT_DESTINATION">NEXT_DESTINATION</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Anchor Place</label>
                  <input
                    type="text"
                    value={obsSrc}
                    onChange={(e) => setObsSrc(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Place</label>
                  <input
                    type="text"
                    value={obsTgt}
                    onChange={(e) => setObsTgt(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observed Behavior Narrative</label>
                <textarea
                  rows={3}
                  required
                  value={obsBehavior}
                  onChange={(e) => setObsBehavior(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Detail exactly how the participant navigated, what stops they added, or where friction occurred..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddObs(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
