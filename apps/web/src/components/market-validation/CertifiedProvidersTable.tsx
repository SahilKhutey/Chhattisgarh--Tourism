import React, { useState } from "react";
import { BadgeCheck, Shield, Phone, Users, Clock, Home, UserCheck, CheckCircle2 } from "lucide-react";

export interface CertifiedProviderItem {
  id: string;
  name: string;
  provider_type: string;
  segment: string;
  sub_circuit: string;
  location: string;
  latitude: number;
  longitude: number;
  verification_status: string;
  certification_level: string;
  daily_capacity: number;
  current_open_leads: number;
  max_lead_limit: number;
  response_time_sla_hours: number;
  contact_phone: string;
  languages: string[];
  safety_trained: boolean;
  amenities: string[];
}

export interface CertifiedProvidersTableProps {
  providers: CertifiedProviderItem[];
  loading?: boolean;
}

export function CertifiedProvidersTable({
  providers,
  loading = false,
}: CertifiedProvidersTableProps) {
  const [selectedSubCircuit, setSelectedSubCircuit] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const subCircuits = ["ALL", "Chitrakote", "Tirathgarh", "Kanger Valley", "Dholkal Ganesh", "Jagdalpur Hub", "Kondagaon Waypoint"];

  const filtered = providers.filter((p) => {
    const matchCircuit = selectedSubCircuit === "ALL" || p.sub_circuit.toLowerCase() === selectedSubCircuit.toLowerCase();
    const matchType = selectedType === "ALL" || p.provider_type.toUpperCase() === selectedType.toUpperCase();
    return matchCircuit && matchType;
  });

  const homestayCount = providers.filter((p) => p.provider_type === "HOMESTAY").length;
  const guideCount = providers.filter((p) => p.provider_type === "GUIDE").length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="certified-providers-table">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {providers.length} Certified Providers
            </span>
            <span className="text-xs text-slate-500 font-medium">
              100% Vetted • Level 3 Certification
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
            Bastar Circuit 1 Homestays &amp; Guides Network
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                selectedType === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({providers.length})
            </button>
            <button
              onClick={() => setSelectedType("HOMESTAY")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                selectedType === "HOMESTAY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-indigo-600" />
              Homestays ({homestayCount})
            </button>
            <button
              onClick={() => setSelectedType("GUIDE")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                selectedType === "GUIDE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Guides ({guideCount})
            </button>
          </div>

          {/* Sub-circuit filter */}
          <select
            value={selectedSubCircuit}
            onChange={(e) => setSelectedSubCircuit(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {subCircuits.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All Sub-Circuits" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">
          Loading certified provider roster...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          No certified providers match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.provider_type === "HOMESTAY"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {item.provider_type === "HOMESTAY" ? <Home className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {item.provider_type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Level 3 Certified
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {item.sub_circuit} • <span className="text-slate-400">{item.location}</span>
                </div>

                {/* Capacity & SLA Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Capacity:</span>
                      <span className="font-bold text-slate-800">{item.daily_capacity} / day</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Response SLA:</span>
                      <span className="font-bold text-emerald-700">{item.response_time_sla_hours} hrs</span>
                    </div>
                  </div>
                </div>

                {/* Lead limit indicator */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-slate-500">Open Leads Load:</span>
                    <span className="font-bold text-slate-700 font-mono">
                      {item.current_open_leads} / {item.max_lead_limit} Max
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.current_open_leads >= 8
                          ? "bg-rose-500"
                          : item.current_open_leads >= 5
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${(item.current_open_leads / item.max_lead_limit) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Languages */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.languages.map((lang) => (
                    <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {lang}
                    </span>
                  ))}
                  {item.safety_trained && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5 text-amber-600" />
                      SOS Trained
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Dispatch Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-600">{item.contact_phone}</span>
                <a
                  href={`tel:${item.contact_phone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-md text-[11px] font-semibold transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  Dispatch
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
