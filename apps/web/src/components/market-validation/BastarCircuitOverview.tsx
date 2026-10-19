import React, { useState } from "react";
import { ShieldAlert, Compass, MapPin, PhoneCall, AlertOctagon, CheckCircle2 } from "lucide-react";

export interface BastarDestination {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  role: string;
  type: string;
  emergency_station: string;
}

export interface EmergencyRosterItem {
  id: string;
  station_name: string;
  type: string;
  district: string;
  phone: string;
  channel: string;
  avg_response_minutes: number;
  status: string;
}

export interface BastarCircuitOverviewProps {
  pilotId?: string;
  destinations?: BastarDestination[];
  emergencyRoster?: EmergencyRosterItem[];
  onSimulateIncident?: () => void;
  isSimulating?: boolean;
}

const DEFAULT_DESTINATIONS: BastarDestination[] = [
  {
    id: "chitrakote-falls",
    name: "Chitrakote Falls",
    district: "Bastar",
    latitude: 19.2017,
    longitude: 81.7061,
    role: "ANCHOR_ATTRACTION",
    type: "WATERFALL",
    emergency_station: "Chitrakote Forest Range Office (+91-7782-263011)",
  },
  {
    id: "tirathgarh-falls",
    name: "Tirathgarh Falls",
    district: "Bastar",
    latitude: 18.9167,
    longitude: 81.8667,
    role: "CLUSTER_SPOKE",
    type: "WATERFALL",
    emergency_station: "Jagdalpur Police Control Room (+91-7782-220100)",
  },
  {
    id: "kanger-valley-caves",
    name: "Kotumsar Caves & Kanger Valley",
    district: "Bastar",
    latitude: 18.8833,
    longitude: 81.9333,
    role: "WILDLIFE_CAVES",
    type: "NATIONAL_PARK",
    emergency_station: "Bastar Forest Ranger Headquarters (+91-7782-222422)",
  },
  {
    id: "dholkal-ganesh",
    name: "Dholkal Ganesh Peak",
    district: "Dantewada",
    latitude: 18.7735,
    longitude: 81.2891,
    role: "HIGH_ALTITUDE_TREK",
    type: "HERITAGE_TEMPLE",
    emergency_station: "Dantewada District Hospital & Police (+91-7856-252412)",
  },
];

const DEFAULT_ROSTER: EmergencyRosterItem[] = [
  {
    id: "esc-1",
    station_name: "Chitrakote Forest Range Office",
    type: "RANGER_DISPATCH",
    district: "Bastar",
    phone: "+91-7782-263011",
    channel: "VHF_RADIO_AND_WHATSAPP",
    avg_response_minutes: 14,
    status: "ARMED",
  },
  {
    id: "esc-2",
    station_name: "Kanger Valley Ranger Station",
    type: "FOREST_SEARCH_AND_RESCUE",
    district: "Bastar",
    phone: "+91-7782-222422",
    channel: "SATELLITE_AND_GSM",
    avg_response_minutes: 18,
    status: "ARMED",
  },
  {
    id: "esc-3",
    station_name: "Jagdalpur GMC Trauma Center",
    type: "TRAUMA_AND_MEDICAL",
    district: "Bastar",
    phone: "+91-7782-223048",
    channel: "DIRECT_AMBULANCE_DISPATCH",
    avg_response_minutes: 22,
    status: "ARMED",
  },
  {
    id: "esc-4",
    station_name: "Bastar Tribal Guide Rapid Response",
    type: "LOCAL_FIRST_AID_GUIDE_NETWORK",
    district: "Bastar & Dantewada",
    phone: "+91-7782-229100",
    channel: "OFFLINE_SMS_MESH_ROSTER",
    avg_response_minutes: 8,
    status: "ARMED",
  },
];

export function BastarCircuitOverview({
  destinations = DEFAULT_DESTINATIONS,
  emergencyRoster = DEFAULT_ROSTER,
  onSimulateIncident,
  isSimulating = false,
}: BastarCircuitOverviewProps) {
  const [activeTab, setActiveTab] = useState<"destinations" | "emergency">("destinations");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="bastar-circuit-overview">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              Flagship Pilot Circuit 1
            </span>
            <span className="text-xs text-slate-500 font-medium">Bastar Division • 90-Day Lockdown</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            Bastar Tribal Heritage &amp; Wilderness Circuit
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setActiveTab("destinations")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "destinations"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Destinations (4)
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "emergency"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Safety SOS Roster ({emergencyRoster.length})
            </button>
          </div>

          {onSimulateIncident && (
            <button
              onClick={onSimulateIncident}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              title="Test automated SAFETY_DISABLE circuit breaker killswitch"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              {isSimulating ? "Simulating..." : "Test Safety Killswitch"}
            </button>
          )}
        </div>
      </div>

      {activeTab === "destinations" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                    {dest.type}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{dest.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{dest.district} District</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[10px]">{dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                  Emergency Station:
                </span>
                <span className="font-medium text-slate-700 line-clamp-1">{dest.emergency_station}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyRoster.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-emerald-50/30 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-xs text-slate-900">{item.station_name}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>{item.district}</span> • <span className="font-mono text-[10px] text-indigo-700">{item.channel}</span>
                </div>
                <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1 mt-1">
                  <PhoneCall className="w-3 h-3 text-emerald-600" />
                  <span>{item.phone}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {item.status}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">
                  ~{item.avg_response_minutes}m SLA
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
