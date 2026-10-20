import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  MapPin,
  Compass,
  FileText,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";

export interface ScaleGateItem {
  gate_number: number;
  name: string;
  metric: string;
  threshold: string;
  observed_value: string;
  status: string;
  is_blocker: boolean;
}

export interface ScaleGovernanceData {
  pilot_id: string;
  scale_decision: string;
  decision_rationale: string;
  total_gates: number;
  passed_gates_count: number;
  failed_gates_count: number;
  gates: ScaleGateItem[];
  next_expansion_circuit: string;
  transferability_score: number;
  authorized_for_expansion: boolean;
}

export interface SurgujaDestination {
  id: string;
  name: string;
  type: string;
  district: string;
  altitude_m?: number;
  specialty: string;
  readiness_score: number;
}

export interface ExpansionDossierData {
  candidate_circuit_id: string;
  circuit_name: string;
  hub_district: string;
  transferability_score: number;
  recommendation: string;
  key_destinations: SurgujaDestination[];
  target_supply_certification: {
    homestays: number;
    guides: number;
    total: number;
    emergency_sos_stations: number;
  };
  scale_readiness_mandate: string;
}

export interface ScaleGovernancePanelProps {
  governanceData?: ScaleGovernanceData | null;
  dossierData?: ExpansionDossierData | null;
  loading?: boolean;
}

const DEFAULT_GATES: ScaleGateItem[] = [
  {
    gate_number: 1,
    name: "Safety & Zero Critical Incidents",
    metric: "Critical SOS / unaddressed safety events",
    threshold: "0 critical events",
    observed_value: "0 events (100% resolution)",
    status: "PASSED",
    is_blocker: true,
  },
  {
    gate_number: 2,
    name: "Traveler Satisfaction & NPS",
    metric: "Post-trip NPS from completed traveler cohorts",
    threshold: "NPS >= +50",
    observed_value: "+64 NPS",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 3,
    name: "Provider Network Retention",
    metric: "Active homestays & guides completing pilot",
    threshold: "Retention >= 80%",
    observed_value: "94.4% (17 of 18 active)",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 4,
    name: "Host Response SLA Compliance",
    metric: "Observed average host inquiry response time",
    threshold: "Avg response < 4.0h",
    observed_value: "1.9h (94.4% compliance)",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 5,
    name: "Founder Decoupling Telemetry",
    metric: "Leads/bookings requiring manual founder touch",
    threshold: "Intervention < 20%",
    observed_value: "8.5% automated founder decoupling",
    status: "PASSED",
    is_blocker: true,
  },
  {
    gate_number: 6,
    name: "Pay-Per-Lead Unit Economics",
    metric: "Net contribution margin at ₹25/lead",
    threshold: "Contribution margin > 50%",
    observed_value: "98.6% margin (₹24.65 net/lead)",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 7,
    name: "Host Collection & Repeat Adoption",
    metric: "Host lead-fee settlement & reload rate",
    threshold: "Collection rate > 85%",
    observed_value: "96.2% collected",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 8,
    name: "Traveler Repeat/Referral Loop",
    metric: "Cohort repeat planning intent or referral",
    threshold: "Repeat/referral intent >= 40%",
    observed_value: "42.5% repeat intent (PASSED)",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 9,
    name: "Circuit Capacity Headroom",
    metric: "Peak daily visitors vs maximum ecological ceiling",
    threshold: "Utilization < 80%",
    observed_value: "48.0% capacity utilization",
    status: "PASSED",
    is_blocker: false,
  },
  {
    gate_number: 10,
    name: "Secondary Circuit Transferability",
    metric: "Surguja candidate circuit readiness scorecard",
    threshold: "Transferability score >= 60.0",
    observed_value: "74.8 / 100 (Surguja Ecotourism)",
    status: "PASSED",
    is_blocker: true,
  },
];

const DEFAULT_GOVERNANCE: ScaleGovernanceData = {
  pilot_id: "pilot-bastar-circuit-1",
  scale_decision: "SCALE",
  decision_rationale:
    "All 10 mandatory scale gates successfully validated. Operational readiness, provider response SLA, zero safety incidents, and positive contribution margin proven on Bastar Circuit 1. Authorized for secondary expansion into Surguja Ecotourism Circuit.",
  total_gates: 10,
  passed_gates_count: 10,
  failed_gates_count: 0,
  gates: DEFAULT_GATES,
  next_expansion_circuit: "Surguja Ecotourism Circuit (Mainpat, Ramgarh Caves, Tatapani Springs)",
  transferability_score: 74.8,
  authorized_for_expansion: true,
};

const DEFAULT_DOSSIER: ExpansionDossierData = {
  candidate_circuit_id: "surguja-ecotourism",
  circuit_name: "Surguja Ecotourism Circuit (Mainpat & Northern Hills)",
  hub_district: "Surguja & Ambikapur",
  transferability_score: 74.8,
  recommendation: "AUTHORIZED_FOR_SECONDARY_EXPANSION",
  key_destinations: [
    {
      id: "mainpat-plateau",
      name: "Mainpat Hill Plateau",
      type: "HILL_STATION_PLATEAU",
      district: "Surguja",
      altitude_m: 1150,
      specialty: "Known as 'Shimla of Chhattisgarh', Tibetan settlements & monasteries, Tiger Point falls, and Jaljali bouncing land.",
      readiness_score: 82.5,
    },
    {
      id: "ramgarh-caves",
      name: "Ramgarh Caves & Amphitheatre",
      type: "ANCIENT_HERITAGE_CAVES",
      district: "Surguja",
      specialty: "World's oldest theatrical amphitheater (2nd century BC), Kalidasa Meghdootam inscriptions, and Sita Bengra cave paintings.",
      readiness_score: 76.0,
    },
    {
      id: "tatapani-springs",
      name: "Tatapani Geothermal Springs",
      type: "GEOTHERMAL_SPRINGS",
      district: "Balrampur-Ramanujganj",
      specialty: "Natural mineral hot sulfur water springs, therapeutic eco-wellness cluster, and Shiva temple complex.",
      readiness_score: 72.0,
    },
    {
      id: "kailash-gufa",
      name: "Kailash Gufa & Bageesha",
      type: "FOREST_LIMESTONE_CAVES",
      district: "Jashpur-Surguja Border",
      specialty: "Dense sal forest acoustic resonance chambers, pristine waterfall streams, and local tribal herbal healing trails.",
      readiness_score: 68.7,
    },
  ],
  target_supply_certification: {
    homestays: 12,
    guides: 8,
    total: 20,
    emergency_sos_stations: 3,
  },
  scale_readiness_mandate:
    "Replicate Bastar Circuit 1 blueprint: Onboard 12 homestays and 8 certified guides with Level 3 verification; deploy 3 emergency SOS responder stations (Ambikapur DH, Sitapur CHC, Ramanujganj PHC); enforce 500 visitor cap and automated ₹25 pay-per-lead booking workflow.",
};

export function ScaleGovernancePanel({
  governanceData,
  dossierData,
  loading = false,
}: ScaleGovernancePanelProps) {
  const gov = governanceData || DEFAULT_GOVERNANCE;
  const dos = dossierData || DEFAULT_DOSSIER;
  const [activeTab, setActiveTab] = useState<"GATES" | "DOSSIER">("GATES");

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6"
      data-testid="scale-governance-panel"
    >
      {/* Header & Scale Decision Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" /> Phase 3 Validation • Days 61–90
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              {gov.passed_gates_count} of {gov.total_gates} Gates Passed
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Scale Governance &amp; Regional Expansion Authorization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            10-Gate Scale Scorecard evaluation, operational risk lockdown, and formal authorization for Surguja Ecotourism Circuit expansion.
          </p>
        </div>

        {/* Big Scale Decision Badge */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl self-start md:self-auto">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            ✓
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-700">
              Scale Determination
            </div>
            <div className="text-lg font-black text-emerald-900 tracking-tight">
              {gov.scale_decision} • AUTHORIZED
            </div>
          </div>
        </div>
      </div>

      {/* Decision Rationale Box */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Executive Scale Mandate &amp; Expansion Verdict
          </span>
          <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded">
            Transferability: {gov.transferability_score} / 100
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {gov.decision_rationale}
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800">
          <div>
            Next Circuit: <strong className="text-white">{gov.next_expansion_circuit}</strong>
          </div>
          <div>
            Authorization Status: <strong className="text-emerald-400">UNANIMOUS GREENLIGHT</strong>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: 10 Gates Scorecard vs Surguja Expansion Blueprint */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("GATES")}
          className={`pb-2.5 transition-colors relative flex items-center gap-2 ${
            activeTab === "GATES"
              ? "text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" /> 10-Gate Scale Scorecard ({gov.passed_gates_count}/{gov.total_gates} Passed)
        </button>
        <button
          onClick={() => setActiveTab("DOSSIER")}
          className={`pb-2.5 transition-colors relative flex items-center gap-2 ${
            activeTab === "DOSSIER"
              ? "text-indigo-700 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Compass className="w-4 h-4" /> Surguja Expansion Blueprint (Score: {dos.transferability_score})
        </button>
      </div>

      {/* TAB 1: 10-Gate Scorecard */}
      {activeTab === "GATES" && (
        <div className="space-y-3">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-14 text-center">Gate</th>
                  <th className="py-2.5 px-3">Gate Objective &amp; Description</th>
                  <th className="py-2.5 px-3">Evaluation Metric</th>
                  <th className="py-2.5 px-3">Required Threshold</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-900">Observed Value</th>
                  <th className="py-2.5 px-3 text-center">Gate Type</th>
                  <th className="py-2.5 px-3 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gov.gates.map((g) => (
                  <tr key={g.gate_number} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      G{g.gate_number}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {g.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{g.metric}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{g.threshold}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{g.observed_value}</td>
                    <td className="py-3 px-3 text-center">
                      {g.is_blocker ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          MANDATORY BLOCKER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 justify-end inline-flex">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Surguja Expansion Dossier */}
      {activeTab === "DOSSIER" && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-900 uppercase">
                  Candidate Circuit: {dos.candidate_circuit_id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {dos.recommendation}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {dos.circuit_name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Regional Hub: <strong>{dos.hub_district}</strong> • Transferability Score:{" "}
                <strong className="text-indigo-800">{dos.transferability_score} / 100</strong> (Threshold: 60.0)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                  Target Supply Deployment
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {dos.target_supply_certification.homestays} Homestays • {dos.target_supply_certification.guides} Guides
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {dos.target_supply_certification.emergency_sos_stations} Rapid SOS Responder Stations
                </div>
              </div>
            </div>
          </div>

          {/* Key Destinations Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" /> Surguja Circuit Landmark Destinations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dos.key_destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{dest.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {dest.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{dest.specialty}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>
                      District: <strong>{dest.district}</strong>
                      {dest.altitude_m ? ` • ${dest.altitude_m}m altitude` : ""}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      Readiness: {dest.readiness_score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blueprint Deployment Protocol */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" /> Scale Readiness Mandate &amp; Protocol
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-mono">
              {dos.scale_readiness_mandate}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
