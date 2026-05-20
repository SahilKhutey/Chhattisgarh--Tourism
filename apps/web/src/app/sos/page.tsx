"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Eye, 
  Share2, 
  Flame, 
  Droplet, 
  CloudRain,
  Compass, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Activity,
  Heart
} from "lucide-react";

interface EmergencyContact {
  department: string;
  number: string;
  scope: string;
  notes: string;
}

interface IncidentReport {
  district: string;
  hazardType: "flood" | "fire" | "weather";
  location: string;
  severity: "high" | "moderate" | "low";
  timestamp: string;
  message: string;
}

export default function SOSPage() {
  const [activeDistrict, setActiveDistrict] = useState<string>("bastar");
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [safetyShared, setSafetyShared] = useState<boolean>(false);
  const [reportLogged, setReportLogged] = useState<boolean>(false);

  const emergencyContacts: Record<string, EmergencyContact[]> = {
    bastar: [
      { department: "District Police Control Room", number: "+91-7782-222350", scope: "Crime & immediate physical threat response", notes: "Jagdalpur Headquarters" },
      { department: "Bastar Forest Guard Dispatch", number: "+91-7782-222123", scope: "Wildlife encounters, forest trail rescues", notes: "Kanger Valley Ranger Office" },
      { department: "Maharani Government Hospital Clinic", number: "+91-7782-222624", scope: "Medical emergencies & toxin treatment", notes: "Equipped for anti-venom treatment" },
      { department: "State Disaster Response Force (SDRF)", number: "+91-7782-223400", scope: "Heavy flood canyon rescue operations", notes: "Chitrakote Base Station" }
    ],
    raipur: [
      { department: "Capital Police Control Desk", number: "112 / +91-771-2424240", scope: "General crime & safety violations", notes: "Naya Raipur HQ Desk" },
      { department: "Raipur Main Medical Trauma Center", number: "+91-771-2235600", scope: "High-grade surgery and medical trauma", notes: "AIIMS Raipur Emergency Desk" },
      { department: "State Forest Conservation Command", number: "+91-771-2443200", scope: "State-wide wilderness coordination", notes: "Aranya Bhavan Office" }
    ],
    bilaspur: [
      { department: "Bilaspur City Police Desk", number: "+91-7752-223333", scope: "General law enforcement", notes: "Civil Lines Station" },
      { department: "CIMS Government Medical College", number: "+91-7752-224350", scope: "Critical healthcare emergencies", notes: "Bilaspur Center" },
      { department: "Achanakmar Biosphere Rescue Force", number: "+91-7752-253400", scope: "Forestry hazard & wildlife tracking", notes: "Achanakmar Entrance Desk" }
    ]
  };

  const activeReports: IncidentReport[] = [
    {
      district: "Bastar",
      hazardType: "flood",
      location: "Indravati River Base near Chitrakote Gorge",
      severity: "high",
      timestamp: "10 mins ago",
      message: "Sudden rise in monsoon pool levels. Boating strictly prohibited inside the canyon base. Tourist stairs closed."
    },
    {
      district: "Kawardha",
      hazardType: "weather",
      location: "Maikal Hills surrounding Bhoramdeo",
      severity: "moderate",
      timestamp: "1 hour ago",
      message: "Heavy misty rain limiting visibility to less than 15 meters on local mountain road cuts. Exercise extreme caution."
    },
    {
      district: "Bilaspur",
      hazardType: "fire",
      location: "Achanakmar Tiger Reserve buffer zone",
      severity: "low",
      timestamp: "3 hours ago",
      message: "Localized dry teak leaf controlled forest clearing. No active threat to marked tourist vehicle corridors."
    }
  ];

  const handleSOSTrigger = () => {
    setSosTriggered(!sosTriggered);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-charcoal-stone/10 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-300 bg-red-100 text-xs font-mono font-bold text-red-700 w-fit uppercase">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          Offline Safety Cockpit
        </span>
        <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-red-700">
          Emergency SOS & Disaster System
        </h1>
        <p className="text-sm text-charcoal-stone/60 max-w-xl leading-relaxed">
          High-contrast emergency dashboard. Designed to operate completely offline in remote forest tracks and low-bandwidth mountain corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: SOS Button and Women Safety Sharing panel */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* URGENT SOS ACTUATOR BOARD */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-200/50 shadow-xl flex flex-col items-center text-center gap-6 relative overflow-hidden bg-red-500/5">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"></div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-widest">IMMEDIATE ANCESTRAL CALL</span>
              <h2 className="text-2xl font-sans font-bold text-charcoal-stone">Immediate Security Dispatch</h2>
              <p className="text-xs text-charcoal-stone/65 max-w-md">
                Toggling the SOS switch instantly triggers an offline local alert containing your last cached coordinates, routing telemetry, and emergency profile data to nearby district forest guards.
              </p>
            </div>

            {/* Huge Physical Switch Trigger */}
            <button
              onClick={handleSOSTrigger}
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 shadow-2xl transition-all duration-300 cursor-pointer ${
                sosTriggered
                  ? "bg-red-600 border-red-700 text-white animate-bounce shadow-red-600/30 scale-95"
                  : "bg-white border-red-100 hover:border-red-200 text-red-600 hover:scale-[1.03]"
              }`}
            >
              <ShieldAlert className="w-16 h-16" />
              <span className="font-mono font-bold text-xs mt-1 uppercase tracking-widest">
                {sosTriggered ? "SOS ACTIVE" : "SOS SWITCH"}
              </span>
            </button>

            {sosTriggered && (
              <div className="p-4 rounded-2xl bg-red-600 text-white flex items-center gap-3 animate-pulse text-left w-full">
                <Activity className="w-6 h-6 shrink-0 text-white" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold uppercase">Broadcasting Live Safety Telemetry</span>
                  <span className="text-[10px] text-white/80">
                    Broadcasting local coordinates to Bastar Forest Command Desk. Estimated response team travel: 12 mins.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* WOMEN SAFETY & EMERGENCY SHARING SYSTEM */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col gap-6">
            <h3 className="font-sans font-bold text-lg text-forest-emerald flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-forest-emerald" />
              Women Safety trusted Routing Panel
            </h3>
            <p className="text-xs text-charcoal-stone/65 leading-relaxed">
              Before setting out on remote, low-signal paths, configure your trusted safety corridor. This automatically caches your target route points, estimating your arrival schedules. It enables emergency sharing with verified state authorities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-3">
                <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">CORRIDOR COORDINATES</span>
                <div className="flex flex-col gap-1 text-xs text-charcoal-stone">
                  <span>Start: <strong>Jagdalpur Town Gate</strong></span>
                  <span>Destination: <strong>Tirathgarh Falls Basin</strong></span>
                  <span>Transit Time: <strong>45 mins</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col justify-between gap-3">
                <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">EMERGENCY PROFILE TRUSTEE</span>
                <span className="text-xs text-charcoal-stone/85 leading-tight">
                  Linked Guardian: <strong>State Safety Desk Hotline (112)</strong>
                </span>
                
                <button
                  onClick={() => setSafetyShared(true)}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs font-sans transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    safetyShared
                      ? "bg-green-600 text-white"
                      : "bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige"
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  {safetyShared ? "Trusted Corridor Synced!" : "Sync Trusted Corridor"}
                </button>
              </div>
            </div>

            {safetyShared && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-green-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Success:</strong> Secure route cached. An automated SMS alert containing offline tracking telemetry parameters will be dispatched if check-in time exceeds 60 minutes.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Local Emergency Directory and Natural Disaster Bulletins */}
        <div className="flex flex-col gap-6">
          
          {/* OFFLINE HELPLINE DIRECTORY */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Phone className="w-5 h-5 text-tribal-terracotta" />
              Offline District Directory
            </h3>
            
            {/* District Selector Chips */}
            <div className="flex gap-2 border-b border-charcoal-stone/10 pb-3">
              {[
                { id: "bastar", label: "Bastar" },
                { id: "raipur", label: "Raipur" },
                { id: "bilaspur", label: "Bilaspur" }
              ].map(district => (
                <button
                  key={district.id}
                  onClick={() => setActiveDistrict(district.id)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                    activeDistrict === district.id
                      ? "bg-tribal-terracotta text-white border-transparent shadow"
                      : "bg-white/80 border-charcoal-stone/10 text-charcoal-stone"
                  }`}
                >
                  {district.label}
                </button>
              ))}
            </div>

            {/* Helplines List */}
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {emergencyContacts[activeDistrict].map((contact, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-sans font-bold text-xs text-forest-emerald leading-tight">{contact.department}</span>
                    <span className="text-[8px] font-mono bg-charcoal-stone/5 text-charcoal-stone/60 px-1.5 py-0.5 rounded uppercase shrink-0">
                      {contact.notes.split(" ")[0]}
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal-stone/50 font-sans leading-tight">
                    {contact.scope}
                  </span>
                  <a 
                    href={`tel:${contact.number}`}
                    className="text-xs font-mono font-bold text-tribal-terracotta hover:underline inline-flex items-center gap-1.5 mt-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-tribal-terracotta shrink-0" />
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE DISASTER WARNING BULLETINS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              Active Forestry Bulletins
            </h3>

            <div className="flex flex-col gap-3">
              {activeReports.map((report, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-1.5 relative overflow-hidden">
                  
                  {/* Warning Strip */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                    report.severity === "high" ? "bg-red-600" : report.severity === "moderate" ? "bg-amber-500" : "bg-green-500"
                  }`}></div>

                  <div className="flex justify-between items-center pl-1.5">
                    <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{report.timestamp}</span>
                    <span className={`text-[8px] font-mono font-bold uppercase px-1.5 rounded ${
                      report.severity === "high" ? "bg-red-100 text-red-600" : report.severity === "moderate" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                    }`}>
                      {report.severity} alert
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pl-1.5 text-xs text-charcoal-stone font-bold">
                    {report.hazardType === "flood" && <Droplet className="w-3.5 h-3.5 text-blue-600" />}
                    {report.hazardType === "fire" && <Flame className="w-3.5 h-3.5 text-orange-600" />}
                    {report.hazardType === "weather" && <CloudRain className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{report.location.split("near")[0]}</span>
                  </div>

                  <p className="text-[10px] text-charcoal-stone/60 leading-relaxed pl-1.5">
                    {report.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
