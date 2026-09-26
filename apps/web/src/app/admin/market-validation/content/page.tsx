"use client";

import React, { useEffect, useState } from "react";
import { ContentQualityCard } from "@/components/market-validation/ContentQualityCard";
import { ContentVariantViewer } from "@/components/market-validation/ContentVariantViewer";
import { FileText, Plus, ShieldCheck, Filter, AlertCircle, RefreshCw } from "lucide-react";

export default function ContentAdminPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [cohortFilter, setCohortFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Form State
  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [cohort, setCohort] = useState("BASTAR_CIRCUIT");
  const [category, setCategory] = useState("ATTRACTION");
  const [summary, setSummary] = useState("");

  const loadEntries = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/content/entries", {
      headers: { "X-User-Role": "CONTENT_EDITOR" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        const items = data.items || [];
        setEntries(items);
        if (items.length > 0 && !selectedEntry) {
          setSelectedEntry(items[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback mockup data for preview
        const mockEntries = [
          {
            id: "CE-001",
            content_id: "CONT_CHITRAKOTE_EXP",
            destination_id: "DEST_CHITRAKOTE",
            title: "Chitrakote Falls: The Definitive Monsoon & Winter Guide",
            cohort: "BASTAR_CIRCUIT",
            category: "ATTRACTION",
            summary: "Comprehensive guide to Chitrakote Falls including water flow timings, boating access, safety zones, and resort bookings.",
            quality_score: 84.5,
            governance_status: "CONTENT_VERIFIED",
            last_reviewed_at: new Date().toISOString(),
            content_body: {
              quick_facts: {
                location: "38km west of Jagdalpur",
                best_season: "July to February",
                entry_fee: "₹20 per person",
                timings: "06:00 AM - 06:30 PM",
                nearest_airport: "Jagdalpur (JGB)",
              },
              logistics: {
                road_condition: "All-weather NH63 asphalt",
                parking: "Available, paved lot",
                safety: "Railing protected; cliff edges marked with red indicators",
              },
              nearby_attractions: ["Tirathgarh Falls", "Kotumsar Cave", "Danteshwari Temple"],
            },
          },
          {
            id: "CE-002",
            content_id: "CONT_TIRATHGARH_PRAC",
            destination_id: "DEST_TIRATHGARH",
            title: "Tirathgarh Step-Fall Logistics & Timings",
            cohort: "BASTAR_CIRCUIT",
            category: "ATTRACTION",
            summary: "Step-by-step navigation down the tiered cascades of Kanger Valley.",
            quality_score: 79.0,
            governance_status: "CONTENT_REVIEWED",
            last_reviewed_at: new Date().toISOString(),
            content_body: {
              quick_facts: {
                steps_count: "210 stone steps",
                ideal_duration: "3 hours",
                photography_permits: "None required for mobile / non-commercial",
              },
            },
          },
          {
            id: "CE-003",
            content_id: "CONT_MAINPAT_OVERVIEW",
            destination_id: "DEST_MAINPAT",
            title: "Mainpat: The Shimla of Chhattisgarh High Plateau",
            cohort: "SURGUJA_NORTH",
            category: "REGION_GUIDE",
            summary: "Tibetan settlements, bouncy land of Jaljali, and Tiger Point viewpoints.",
            quality_score: 72.0,
            governance_status: "CONTENT_DRAFT",
            last_reviewed_at: new Date().toISOString(),
            content_body: {
              quick_facts: {
                elevation: "1100m ASL",
                climate: "Sub-tropical temperate",
              },
            },
          },
        ];
        setEntries(mockEntries);
        setSelectedEntry(mockEntries[0]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      destination_id: destinationId || undefined,
      cohort,
      category,
      summary,
      content_body: {
        quick_facts: {
          created_at: new Date().toISOString(),
          status: "INITIAL_DRAFT",
        },
      },
    };

    fetch("/api/v1/market-validation/content/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "CONTENT_EDITOR",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create");
        return res.json();
      })
      .then((created) => {
        setEntries([created, ...entries]);
        setSelectedEntry(created);
        setShowCreateModal(false);
        setTitle("");
        setDestinationId("");
        setSummary("");
      })
      .catch(() => {
        // Local simulation fallback
        const mockNew = {
          id: `CE-${Date.now()}`,
          content_id: `CONT_${title.replace(/\s+/g, "_").toUpperCase().slice(0, 15)}`,
          title,
          destination_id: destinationId,
          cohort,
          category,
          summary,
          quality_score: 65.0,
          governance_status: "CONTENT_DRAFT",
          content_body: { quick_facts: { status: "INITIAL_DRAFT" } },
        };
        setEntries([mockNew, ...entries]);
        setSelectedEntry(mockNew);
        setShowCreateModal(false);
      });
  };

  const filteredEntries = entries.filter((e) => {
    if (cohortFilter === "ALL") return true;
    return e.cohort === cohortFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              MV5 • DOMAIN
            </span>
            <span className="text-xs text-slate-400 font-mono">Content Registry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Tourism Content & Structured Fact Sheets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict quality curation, verified ground facts, and freshness management.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadEntries}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Content Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Cohort:</span>
          {["ALL", "BASTAR_CIRCUIT", "SURGUJA_NORTH", "RAIPUR_URBAN", "BILASPUR_HERITAGE"].map(
            (c) => (
              <button
                key={c}
                onClick={() => setCohortFilter(c)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  cohortFilter === c
                    ? "bg-indigo-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            )
          )}
        </div>
        <span className="text-slate-400 font-mono">{filteredEntries.length} entries registered</span>
      </div>

      {/* Main Grid: Entry List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Entry List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-400">
              Loading content entries...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-400">
              No entries found for this filter.
            </div>
          ) : (
            filteredEntries.map((item) => {
              const isSelected = selectedEntry?.content_id === item.content_id;
              return (
                <div
                  key={item.content_id || item.id}
                  onClick={() => setSelectedEntry(item)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.cohort}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.summary || "No summary provided."}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded border block ${
                          (item.quality_score || 0) >= 75
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        Q: {(item.quality_score || 0).toFixed(0)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {item.governance_status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detail Inspector */}
        <div className="lg:col-span-7 space-y-5">
          {selectedEntry ? (
            <>
              {/* Quality Card */}
              <ContentQualityCard
                score={selectedEntry.quality_score || 75.0}
                governanceStatus={selectedEntry.governance_status || "CONTENT_DRAFT"}
              />

              {/* Content Body Viewer */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Content Schema & Payload Inspector
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {selectedEntry.content_id}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Structured Fact Sheet Payload
                    </span>
                    <pre className="text-xs bg-slate-900 text-slate-200 p-4 rounded-md overflow-x-auto font-mono max-h-72">
                      {JSON.stringify(selectedEntry.content_body || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 text-xs">
              Select a content entry from the left to inspect its quality metrics and structured data.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Entry */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Structured Content Entry</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Content Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chitrakote Falls Practical Timing Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination ID</label>
                  <input
                    type="text"
                    placeholder="DEST_CHITRAKOTE"
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cohort</label>
                  <select
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    <option value="BASTAR_CIRCUIT">BASTAR_CIRCUIT</option>
                    <option value="SURGUJA_NORTH">SURGUJA_NORTH</option>
                    <option value="RAIPUR_URBAN">RAIPUR_URBAN</option>
                    <option value="BILASPUR_HERITAGE">BILASPUR_HERITAGE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Executive Summary</label>
                <textarea
                  rows={3}
                  placeholder="Short, highly informative summary answering traveler jobs to be done..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700"
                >
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
