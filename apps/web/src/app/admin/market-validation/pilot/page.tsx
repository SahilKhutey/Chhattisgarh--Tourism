"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PilotDefinition, PilotData } from "@/components/market-validation/PilotDefinition";
import { PilotScopeCard } from "@/components/market-validation/PilotScopeCard";
import { PilotKpiDashboard } from "@/components/market-validation/PilotKpiDashboard";
import { LaunchControlPanel, LaunchControlItem } from "@/components/market-validation/LaunchControlPanel";
import { OperationalReadiness } from "@/components/market-validation/OperationalReadiness";
import { BastarCircuitOverview, BastarDestination, EmergencyRosterItem } from "@/components/market-validation/BastarCircuitOverview";
import { CertifiedProvidersTable, CertifiedProviderItem } from "@/components/market-validation/CertifiedProvidersTable";

const DEFAULT_CIRCUIT_CONTROLS: LaunchControlItem[] = [
  {
    id: "ctrl-traffic-limit",
    control_type: "TRAFFIC_LIMIT",
    name: "Max Daily Active Travelers",
    enabled: true,
    threshold: 500.0,
    current_value: 120.0,
    action: "THROTTLE",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-booking-limit",
    control_type: "BOOKING_LIMIT",
    name: "Max Open Pending Leads per Provider",
    enabled: true,
    threshold: 10.0,
    current_value: 3.0,
    action: "HALT_BOOKINGS",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-circuit-breaker",
    control_type: "CIRCUIT_BREAKER",
    name: "Max Provider Response Failure Rate %",
    enabled: true,
    threshold: 30.0,
    current_value: 8.5,
    action: "ALERT",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-safety-disable",
    control_type: "SAFETY_DISABLE",
    name: "Critical Unaddressed Safety Incidents",
    enabled: true,
    threshold: 1.0,
    current_value: 0.0,
    action: "PAUSE_PILOT",
    owner: "SYSTEM",
    triggered: false,
  },
];

const DEFAULT_PROVIDERS: CertifiedProviderItem[] = [
  // 10 Vetted Tribal Homestays
  {
    id: "bastar-chitrakote-dandami-homestay",
    name: "Dandami Tribal Heritage Cottage",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Chitrakote",
    location: "Chitrakote Falls Plateau",
    latitude: 19.2025,
    longitude: 81.7075,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7782-229045",
    languages: ["Gondi", "Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Organic Tribal Meals", "Solar Power", "Bilingual Host", "First Aid Kit"],
  },
  {
    id: "bastar-chitrakote-falls-view-stay",
    name: "Chitrakote Falls Cliff Edge Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Chitrakote",
    location: "Near Sunset Point, Chitrakote",
    latitude: 19.2008,
    longitude: 81.7042,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.1,
    contact_phone: "+91-7782-229046",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Gorge View", "Traditional Thali", "River Walk Guide"],
  },
  {
    id: "bastar-tirathgarh-eco-retreat",
    name: "Tirathgarh Tribal Valley Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Tirathgarh",
    location: "Tirathgarh Village Buffer Zone",
    latitude: 18.9180,
    longitude: 81.8650,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 2.5,
    contact_phone: "+91-7782-228951",
    languages: ["Gondi", "Hindi"],
    safety_trained: true,
    amenities: ["Mugga Silk Weaving Walk", "Forest Honey Tasting", "Emergency Satellite Beacon"],
  },
  {
    id: "bastar-tirathgarh-munda-stay",
    name: "Munda Tribal Heritage Home",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Tirathgarh",
    location: "Lower Tirathgarh Stream",
    latitude: 18.9145,
    longitude: 81.8682,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 6,
    current_open_leads: 1,
    max_lead_limit: 10,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7782-228952",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Stream Bathing Guide", "Mahua Forest Trail", "First Aid Trained"],
  },
  {
    id: "bastar-kanger-kotumsar-camp",
    name: "Kotumsar Cave Forest Camp",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kanger Valley",
    location: "Kanger Valley Gate Entry",
    latitude: 18.8850,
    longitude: 81.9310,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 14,
    current_open_leads: 5,
    max_lead_limit: 10,
    response_time_sla_hours: 2.0,
    contact_phone: "+91-7782-228953",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Caving Equipment Rental", "National Park Passes", "Solar Hot Water"],
  },
  {
    id: "bastar-kanger-gupteshwar-lodge",
    name: "Gupteshwar Gorge Eco Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kanger Valley",
    location: "Sabari River Confluence, Kanger",
    latitude: 18.8720,
    longitude: 81.9450,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.8,
    contact_phone: "+91-7782-228954",
    languages: ["Gondi", "Hindi"],
    safety_trained: true,
    amenities: ["Limestone Cave Walk", "Bird Watching Tower", "First Aid Kit"],
  },
  {
    id: "bastar-dholkal-ganesh-basecamp",
    name: "Dholkal Peak Tribal Trek Basecamp",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Dholkal Ganesh",
    location: "Faraspal Village, Dantewada",
    latitude: 18.7810,
    longitude: 81.2950,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 16,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 1.9,
    contact_phone: "+91-7856-252410",
    languages: ["Gondi", "Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Trekking Poles & Boots", "Early Morning Summit Rations", "GPS Tracker"],
  },
  {
    id: "bastar-dholkal-bailadila-haven",
    name: "Bailadila Foothills Tribal Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Dholkal Ganesh",
    location: "Bacheli Foothills",
    latitude: 18.7200,
    longitude: 81.2500,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 3.0,
    contact_phone: "+91-7856-252411",
    languages: ["Hindi", "English"],
    safety_trained: true,
    amenities: ["Mountain Biking", "Local Gond Folk Evenings", "Emergency Contact Station"],
  },
  {
    id: "bastar-jagdalpur-bastariya-stay",
    name: "Bastariya Cultural Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Jagdalpur Hub",
    location: "Jagdalpur City Transit Base",
    latitude: 19.0735,
    longitude: 82.0289,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 5,
    max_lead_limit: 10,
    response_time_sla_hours: 1.2,
    contact_phone: "+91-7782-220555",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Airport/Railway Pickup", "High-speed Wi-Fi", "Circuit Route Briefing"],
  },
  {
    id: "bastar-kondagaon-dhokra-stay",
    name: "Bell Metal Art Village Stay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kondagaon Waypoint",
    location: "Bhelvapadar Artisan Enclave, Kondagaon",
    latitude: 19.5960,
    longitude: 81.6660,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.2,
    contact_phone: "+91-7786-242100",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Dhokra Metal Casting Workshop", "Terracotta Craft Studio", "Traditional Cooking"],
  },

  // 8 Licensed Tribal Guides
  {
    id: "guide-chitrakote-badal-mandavi",
    name: "Badal Mandavi (Senior Gondi Nature Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Chitrakote",
    location: "Chitrakote River Basin",
    latitude: 19.2017,
    longitude: 81.7061,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 15,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 1.4,
    contact_phone: "+91-7782-229101",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["River Safety Certified", "Folklore Interpretation", "Binoculars Provided"],
  },
  {
    id: "guide-chitrakote-sukhram-kashyap",
    name: "Sukhram Kashyap (Waterfalls & Heritage Storyteller)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Chitrakote",
    location: "Chitradhara & Chitrakote",
    latitude: 19.2050,
    longitude: 81.7080,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.0,
    contact_phone: "+91-7782-229102",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Historic Battle of Bastar Narratives", "Sunset Photography Spots"],
  },
  {
    id: "guide-tirathgarh-somaru-baghel",
    name: "Somaru Baghel (Geology & Canyon Trek Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Tirathgarh",
    location: "Tirathgarh 3-Tier Falls",
    latitude: 18.9167,
    longitude: 81.8667,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 1.6,
    contact_phone: "+91-7782-228960",
    languages: ["Gondi", "Hindi"],
    safety_trained: true,
    amenities: ["Canyon Scrambling Ropes", "Aquatic Safety Cert", "Medicinal Plants Tour"],
  },
  {
    id: "guide-kanger-chaitu-maravi",
    name: "Chaitu Maravi (Biospeleology Cave Specialist)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kanger Valley",
    location: "Kotumsar & Kailash Caves",
    latitude: 18.8833,
    longitude: 81.9333,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7782-228961",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Oxygen & CO2 Cave Detectors", "Cave Helmet & Headlamps", "Blind Fish Biology"],
  },
  {
    id: "guide-kanger-rainu-kunjam",
    name: "Rainu Kunjam (Wildlife & Birding Specialist)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kanger Valley",
    location: "Kanger Dhara & National Park",
    latitude: 18.8900,
    longitude: 81.9200,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 1,
    max_lead_limit: 10,
    response_time_sla_hours: 2.3,
    contact_phone: "+91-7782-228962",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Bastar Hill Myna Call mimicry", "Spotting Scope", "Snake Rescue Certified"],
  },
  {
    id: "guide-dholkal-budhram-netam",
    name: "Budhram Netam (High-Altitude Rock & Temple Trek Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Dholkal Ganesh",
    location: "Dholkal Peak Trailhead",
    latitude: 18.7735,
    longitude: 81.2891,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 1.7,
    contact_phone: "+91-7856-252415",
    languages: ["Gondi", "Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Climbing Safety Harness", "Altitude Sickness Kit", "Ancient Idol Legend Guide"],
  },
  {
    id: "guide-jagdalpur-mangal-korram",
    name: "Mangal Korram (Anthropological & Haat Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Jagdalpur Hub",
    location: "Jagdalpur & Tokapal Weekly Haats",
    latitude: 19.0735,
    longitude: 82.0289,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7782-220556",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Tribal Haat Barter Etiquette", "Handicraft Price Negotiation", "Local Food Tasting"],
  },
  {
    id: "guide-kondagaon-ramesh-ghadwa",
    name: "Ramesh Ghadwa (Dhokra Artisan & Metal Trail Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kondagaon Waypoint",
    location: "Kondagaon Craft Guild",
    latitude: 19.5960,
    longitude: 81.6660,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 1,
    max_lead_limit: 10,
    response_time_sla_hours: 2.4,
    contact_phone: "+91-7786-242101",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Direct Artisan Meet", "GI-Certified Dhokra Verification", "Packing & Shipping Help"],
  },
];

export default function PilotAdminPage() {
  const [pilot, setPilot] = useState<PilotData | null>(null);
  const [controls, setControls] = useState<LaunchControlItem[]>(DEFAULT_CIRCUIT_CONTROLS);
  const [providers, setProviders] = useState<CertifiedProviderItem[]>(DEFAULT_PROVIDERS);
  const [destinations, setDestinations] = useState<BastarDestination[]>([]);
  const [emergencyRoster, setEmergencyRoster] = useState<EmergencyRosterItem[]>([]);
  const [founderInterventionRate, setFounderInterventionRate] = useState<number>(0.117);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchPilot = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/pilots", {
      headers: { "X-User-Role": "PILOT_OPERATOR" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const p = data[0];
          setPilot(p);

          // Fetch circuit readiness, controls, and providers
          fetch(`/api/v1/market-validation/pilots/${p.id}/circuit-readiness`)
            .then((res) => (res.ok ? res.json() : null))
            .then((readiness) => {
              if (readiness) {
                if (readiness.destinations) setDestinations(readiness.destinations);
                if (readiness.emergency_roster) setEmergencyRoster(readiness.emergency_roster);
                if (readiness.founder_intervention_rate !== undefined) {
                  setFounderInterventionRate(readiness.founder_intervention_rate);
                }
              }
            })
            .catch(() => {});

          fetch(`/api/v1/market-validation/pilots/${p.id}/certified-providers`)
            .then((res) => (res.ok ? res.json() : null))
            .then((provs) => {
              if (Array.isArray(provs) && provs.length > 0) {
                setProviders(provs);
              }
            })
            .catch(() => {});

          fetch(`/api/v1/market-validation/launch-controls/${p.id}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((ctrls) => {
              if (Array.isArray(ctrls) && ctrls.length > 0) {
                setControls(ctrls);
              }
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPilot();
  }, [fetchPilot]);

  const handlePause = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/pause`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleResume = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/resume`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleComplete = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/complete`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleTransition = (target: string) => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/transition/${target}`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleToggleControl = (controlId: string, enabled: boolean) => {
    fetch(`/api/v1/market-validation/launch-controls/control/${controlId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "PILOT_OPERATOR",
      },
      body: JSON.stringify({ enabled }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setControls((prev) =>
          prev.map((c) => (c.id === controlId ? { ...c, enabled: updated.enabled, triggered: updated.triggered } : c))
        );
      })
      .catch(() => {
        setControls((prev) =>
          prev.map((c) => (c.id === controlId ? { ...c, enabled } : c))
        );
      });
  };

  const handleSimulateEmergencyIncident = () => {
    if (!pilot) return;
    setIsSimulating(true);
    fetch(`/api/v1/market-validation/launch-controls/${pilot.id}/simulate-incident`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
      },
    })
      .then((res) => res.json())
      .then((evalResp) => {
        setIsSimulating(false);
        if (evalResp && evalResp.controls) {
          setControls(evalResp.controls);
        }
        if (evalResp && evalResp.pilot_status) {
          setPilot((prev) => (prev ? { ...prev, status: evalResp.pilot_status } : prev));
        }
      })
      .catch(() => {
        setIsSimulating(false);
        // Fallback local simulation
        setControls((prev) =>
          prev.map((c) =>
            c.control_type === "SAFETY_DISABLE"
              ? { ...c, current_value: 1.0, triggered: true }
              : c
          )
        );
        setPilot((prev) => (prev ? { ...prev, status: "PAUSED" } : prev));
      });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          90-Day Pilot Lockdown &amp; Operational Readiness • Bastar Circuit 1
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Bastar Circuit 1 Execution Command &amp; Launch Controls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-integrity operational console for Bastar Tribal Heritage Circuit 1 (Chitrakote Falls, Tirathgarh Falls, Kanger Valley Caves, Dholkal Ganesh). Enforcing 18 vetted homestays &amp; guides certification, SOS emergency escalation, 500 daily active travelers cap, max 10 open leads/host, &amp; founder decoupling (&lt; 20%).
        </p>
      </div>

      {pilot ? (
        <>
          <PilotDefinition
            pilot={pilot}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            onTransition={handleTransition}
            isLoading={loading}
          />

          {/* Bastar Circuit 1 Topology & Emergency Safety Escalation */}
          <BastarCircuitOverview
            pilotId={pilot.id}
            destinations={destinations.length > 0 ? destinations : undefined}
            emergencyRoster={emergencyRoster.length > 0 ? emergencyRoster : undefined}
            onSimulateIncident={handleSimulateEmergencyIncident}
            isSimulating={isSimulating}
          />

          {/* Automated Launch Controls & Circuit Breakers */}
          <LaunchControlPanel
            controls={controls}
            onToggleControl={handleToggleControl}
          />

          {/* 18 Certified Tribal Homestays & Licensed Guides Network */}
          <CertifiedProvidersTable
            providers={providers}
            loading={loading}
          />

          {/* Operational Readiness & Founder Decoupling Telemetry */}
          <OperationalReadiness
            founderInterventionRate={founderInterventionRate}
            readinessStatus={founderInterventionRate <= 0.2 ? "READY" : "ATTENTION_REQUIRED"}
          />

          <PilotKpiDashboard />

          <PilotScopeCard
            inScope={pilot.product_scope?.in_scope}
            outOfScope={pilot.product_scope?.out_of_scope}
          />
        </>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
          Loading pilot configuration...
        </div>
      )}
    </div>
  );
}
