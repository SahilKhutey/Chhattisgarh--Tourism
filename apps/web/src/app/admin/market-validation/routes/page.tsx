"use client";

import React, { useEffect, useState } from "react";
import { RouteExperiment, RouteValidationData } from "@/components/market-validation/RouteExperiment";
import { Navigation, Plus, Route, AlertCircle } from "lucide-react";

export default function RoutesAdminPage() {
  const [routes, setRoutes] = useState<RouteValidationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [origin, setOrigin] = useState("Raipur");
  const [destination, setDestination] = useState("Jagdalpur");
  const [stopsText, setStopsText] = useState("Kanker, Kondagaon");
  const [durationMins, setDurationMins] = useState(360);
  const [mode, setMode] = useState<"CAR" | "BIKE" | "BUS" | "TRAIN" | "TREK">("CAR");
  const [evidence, setEvidence] = useState("NH30 corridor with craft stops");

  const loadRoutes = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/geography/routes/validate", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((r) => r.json())
      .then((data) => {
        setRoutes(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo routes
        setRoutes([
          {
            id: "rt-1",
            origin: "Raipur",
            destination: "Jagdalpur",
            intermediate_places: ["Kanker Palace", "Kondagaon Bell Metal Workshop"],
            estimated_duration_minutes: 360,
            travel_mode: "CAR",
            feasibility: "FEASIBLE",
            evidence: "NH30 highway scenic transit with handicraft stop in Kondagaon",
            road_condition_score: 4,
            scenic_score: 4,
          },
          {
            id: "rt-2",
            origin: "Jagdalpur",
            destination: "Chitrakote",
            intermediate_places: [],
            estimated_duration_minutes: 55,
            travel_mode: "CAR",
            feasibility: "FEASIBLE",
            evidence: "Direct state highway, smooth 38km driving",
            road_condition_score: 4,
            scenic_score: 5,
          },
          {
            id: "rt-3",
            origin: "Ambikapur",
            destination: "Sukma",
            intermediate_places: [],
            estimated_duration_minutes: 920,
            travel_mode: "CAR",
            feasibility: "UNREALISTIC",
            evidence: "Exceeds 15 hours non-stop mountain/valley driving; requires intermediate stay in Raipur/Kanker",
            road_condition_score: 3,
            scenic_score: 3,
          },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const intermediateList = stopsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    fetch("/api/v1/market-validation/geography/routes/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "MARKET_RESEARCHER",
      },
      body: JSON.stringify({
        origin: origin.trim(),
        destination: destination.trim(),
        intermediate_places: intermediateList,
        estimated_duration_minutes: durationMins,
        travel_mode: mode,
        evidence: evidence.trim(),
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setShowAddModal(false);
        loadRoutes();
      });
  };

  const feasibleCount = routes.filter((r) => r.feasibility === "FEASIBLE").length;
  const difficultCount = routes.filter((r) => r.feasibility === "DIFFICULT").length;
  const unrealisticCount = routes.filter((r) => r.feasibility === "UNREALISTIC").length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
            Route Feasibility • MV4
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Tourism Route & Corridor Validation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validating whether multi-stop itineraries are realistic, driveable, and sequence-safe.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
        >
          <Plus size={14} />
          <span>Validate New Route</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Feasible Corridors
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{feasibleCount}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Under 10 hours driving</div>
          </div>
          <Route className="text-emerald-500" size={32} />
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Difficult Corridors
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">{difficultCount}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">10 to 14 hours driving</div>
          </div>
          <AlertCircle className="text-amber-500" size={32} />
        </div>

        <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-800 uppercase tracking-wider">
              Unrealistic Corridors
            </div>
            <div className="text-2xl font-black text-red-900 mt-1">{unrealisticCount}</div>
            <div className="text-[11px] text-red-600 mt-0.5">Over 14 hours single day</div>
          </div>
          <Navigation className="text-red-500" size={32} />
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 gap-4">
        {routes.map((rt, idx) => (
          <RouteExperiment key={rt.id || idx} route={rt} />
        ))}
      </div>

      {/* Validate New Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Validate Route Feasibility</h3>
            <form onSubmit={handleCreateRoute} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Origin City/Place</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intermediate Stops (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanker Palace, Kondagaon Crafts"
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Est. Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="CAR">CAR</option>
                    <option value="BIKE">BIKE</option>
                    <option value="BUS">BUS</option>
                    <option value="TRAIN">TRAIN</option>
                    <option value="TREK">TREK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Road & Corridor Notes</label>
                <textarea
                  rows={2}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Road conditions, ghat sections, safety advisory..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Validate Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
