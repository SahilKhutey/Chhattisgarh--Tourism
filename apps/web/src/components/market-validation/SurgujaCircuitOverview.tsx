import React, { useState } from "react";
import { ShieldAlert, Compass, MapPin, PhoneCall, AlertOctagon, CheckCircle2, Mountain, Flame, TreePine } from "lucide-react";

export interface SurgujaDestinationItem {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  altitude_m?: number;
  role: string;
  type: string;
  specialty?: string;
  emergency_station: string;
  readiness_score?: number;
}

export interface SurgujaEmergencyRosterItem {
  id: string;
  station_name: string;
  type: string;
  district: string;
  phone: string;
  channel: string;
  avg_response_minutes: number;
  status: string;
}

export interface SurgujaCircuitOverviewProps {
  pilotId?: string;
  destinations?: SurgujaDestinationItem[];
  emergencyRoster?: SurgujaEmergencyRosterItem[];
  onSimulateIncident?: () => void;
  isSimulating?: boolean;
}

const DEFAULT_SURGUJA_DESTINATIONS: SurgujaDestinationItem[] = [
  {
    id: "mainpat-plateau",
    name: "Mainpat Hill Plateau",
    district: "Surguja",
    latitude: 22.8122,
    longitude: 83.2844,
    altitude_m: 1150,
    role: "ANCHOR_ATTRACTION",
    type: "HILL_PLATEAU_ECOTOURISM",
    specialty: "Known as 'Shimla of Chhattisgarh', Tibetan settlements, Tiger Point falls, and Jaljali bouncing peatland.",
    emergency_station: "Mainpat Forest Range Office (+91-7774-275110) & Sitapur CHC (+91-7774-245100)",
    readiness_score: 85.0,
  },
  {
    id: "ramgarh-caves",
    name: "Ramgarh Caves & Amphitheatre",
    district: "Surguja",
    latitude: 22.8833,
    longitude: 82.9167,
    altitude_m: 620,
    role: "ANCIENT_HERITAGE_ANCHOR",
    type: "ARCHAEOLOGICAL_CAVES",
    specialty: "World's oldest theatrical stage (2nd century BC), Sita Bengra, Jogimara inscriptions, and Kalidasa site.",
    emergency_station: "Udaypur Police Outpost (+91-7774-232100) & Ambikapur District Hospital (+91-7774-222401)",
    readiness_score: 80.0,
  },
  {
    id: "tatapani-springs",
    name: "Tatapani Geothermal Springs",
    district: "Balrampur-Ramanujganj",
    latitude: 23.6872,
    longitude: 83.6514,
    altitude_m: 480,
    role: "WELLNESS_CLUSTER_SPOKE",
    type: "GEOTHERMAL_SPRINGS",
    specialty: "Natural boiling sulfur hot springs with therapeutic mineral waters, eco-wellness bathing pools.",
    emergency_station: "Ramanujganj Primary Health Post (+91-7774-261200) & Balrampur PCR (+91-7774-282100)",
    readiness_score: 75.0,
  },
  {
    id: "kailash-gufa",
    name: "Kailash Gufa & Bageesha",
    district: "Jashpur-Surguja Border",
    latitude: 22.9510,
    longitude: 83.6215,
    altitude_m: 780,
    role: "NATURE_TRAIL_SPOKE",
    type: "LIMESTONE_CAVES_FOREST",
    specialty: "Dense sal forest acoustic resonance chambers, perennial sweetwater streams, and Oraon herbal trails.",
    emergency_station: "Bagicha Forest Range Headquarters (+91-7774-252110) & Ambikapur Trauma Center",
    readiness_score: 72.5,
  },
];

const DEFAULT_SURGUJA_ROSTER: SurgujaEmergencyRosterItem[] = [
  {
    id: "sos-station-ambikapur-trauma",
    station_name: "Ambikapur GMC Trauma Center",
    type: "HOSPITAL_TRAUMA_CENTER",
    district: "Surguja",
    phone: "+91-7774-222401",
    channel: "DIRECT_EMERGENCY_HOTLINE",
    avg_response_minutes: 18,
    status: "ARMED_AND_READY",
  },
  {
    id: "sos-station-sitapur-chc",
    station_name: "Sitapur Community Health Center & Forest Post",
    type: "REGIONAL_HEALTH_AND_RANGER",
    district: "Surguja",
    phone: "+91-7774-245100",
    channel: "VHF_RADIO_AND_LANDLINE",
    avg_response_minutes: 22,
    status: "ARMED_AND_READY",
  },
  {
    id: "sos-station-ramanujganj-phc",
    station_name: "Ramanujganj Primary Health & Thermal Range Unit",
    type: "GEOTHERMAL_SAFETY_POST",
    district: "Balrampur-Ramanujganj",
    phone: "+91-7774-261200",
    channel: "CELL_AND_WHATSAPP_DISPATCH",
    avg_response_minutes: 25,
    status: "ARMED_AND_READY",
  },
];

export function SurgujaCircuitOverview({
  destinations = DEFAULT_SURGUJA_DESTINATIONS,
  emergencyRoster = DEFAULT_SURGUJA_ROSTER,
  onSimulateIncident,
  isSimulating = false,
}: SurgujaCircuitOverviewProps) {
  const [activeTab, setActiveTab] = useState<"destinations" | "emergency">("destinations");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="surguja-circuit-overview">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              Secondary Expansion Circuit 2
            </span>
            <span className="text-xs text-slate-500 font-medium">Surguja Division • Authorized Scale</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-indigo-600" />
            Surguja Ecotourism &amp; Highland Heritage Circuit
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
              Destinations ({destinations.length})
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                    {dest.type.replace(/_/g, " ")}
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
                  {dest.altitude_m && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[10px]">{dest.altitude_m}m</span>
                    </>
                  )}
                </div>
                {dest.specialty && (
                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">{dest.specialty}</p>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyRoster.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-indigo-50/30 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-700" />
                  <span className="font-bold text-xs text-slate-900">{item.station_name}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>{item.district}</span> • <span className="font-mono text-[10px] text-indigo-700">{item.channel}</span>
                </div>
                <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1 mt-1">
                  <PhoneCall className="w-3 h-3 text-indigo-600" />
                  <span>{item.phone}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
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
