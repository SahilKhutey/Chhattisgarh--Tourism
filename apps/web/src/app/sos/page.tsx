"use client";

import { useState, useEffect } from "react";
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
  Heart,
  Volume2,
  VolumeX
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface EmergencyContact {
  department: string;
  department_hi?: string;
  department_cg?: string;
  number: string;
  scope: string;
  scope_hi?: string;
  scope_cg?: string;
  notes: string;
  notes_hi?: string;
  notes_cg?: string;
}

interface IncidentReport {
  district: string;
  hazardType: "flood" | "fire" | "weather";
  location: string;
  location_hi?: string;
  location_cg?: string;
  severity: "high" | "moderate" | "low";
  timestamp: string;
  timestamp_hi?: string;
  timestamp_cg?: string;
  message: string;
  message_hi?: string;
  message_cg?: string;
}

export default function SOSPage() {
  const [activeDistrict, setActiveDistrict] = useState<string>("bastar");
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [safetyShared, setSafetyShared] = useState<boolean>(false);
  const { lang, t, speakText, stopSpeaking, isSpeaking } = useLanguage();
  const [speakingReportIndex, setSpeakingReportIndex] = useState<number | null>(null);

  // Stop speaking when user navigates away to prevent speech continuing inappropriately
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingReportIndex(null);
    }
  }, [isSpeaking]);

  const emergencyContacts: Record<string, EmergencyContact[]> = {
    bastar: [
      { 
        department: "District Police Control Room", 
        department_hi: "जिला पुलिस नियंत्रण कक्ष",
        department_cg: "जिला पुलिस नियंत्रण कक्ष",
        number: "+91-7782-222350", 
        scope: "Crime & immediate physical threat response", 
        scope_hi: "अपराध और तत्काल शारीरिक खतरे की प्रतिक्रिया",
        scope_cg: "अपराध अउ तुरंत सुरक्षा प्रतिक्रिया",
        notes: "Jagdalpur Headquarters",
        notes_hi: "जगदलपुर मुख्यालय",
        notes_cg: "जगदलपुर मुख्यालय"
      },
      { 
        department: "Bastar Forest Guard Dispatch", 
        department_hi: "बस्तर वन रक्षक प्रेषण",
        department_cg: "बस्तर वन रक्षक प्रेषण",
        number: "+91-7782-222123", 
        scope: "Wildlife encounters, forest trail rescues", 
        scope_hi: "वन्यजीवों से मुठभेड़, जंगल के रास्तों पर बचाव",
        scope_cg: "जंगली जीव अउ जंगल रद्दा म बचाव",
        notes: "Kanger Valley Ranger Office",
        notes_hi: "कांगेर घाटी रेंजर कार्यालय",
        notes_cg: "कांगेर घाटी रेंजर कार्यालय"
      },
      { 
        department: "Maharani Government Hospital Clinic", 
        department_hi: "महारानी सरकारी अस्पताल क्लिनिक",
        department_cg: "महारानी सरकारी अस्पताल क्लिनिक",
        number: "+91-7782-222624", 
        scope: "Medical emergencies & toxin treatment", 
        scope_hi: "चिकित्सा आपात स्थिति और विष उपचार",
        scope_cg: "दवाई अउ जहर के इलाज",
        notes: "Equipped for anti-venom treatment",
        notes_hi: "एंटी-वेनम उपचार के लिए सुसज्जित",
        notes_cg: "सांप काटे के दवाई उपलब्ध हे"
      },
      { 
        department: "State Disaster Response Force (SDRF)", 
        department_hi: "राज्य आपदा प्रतिक्रिया बल (एसडीआरएफ)",
        department_cg: "राज्य आपदा प्रतिक्रिया बल (एसडीआरएफ)",
        number: "+91-7782-223400", 
        scope: "Heavy flood canyon rescue operations", 
        scope_hi: "भारी बाढ़ घाटी बचाव अभियान",
        scope_cg: "बाढ़ अउ घाटी म बचाव अभियान",
        notes: "Chitrakote Base Station",
        notes_hi: "चित्रकोट बेस स्टेशन",
        notes_cg: "चित्रकोट बेस स्टेशन"
      }
    ],
    raipur: [
      { 
        department: "Capital Police Control Desk", 
        department_hi: "राजधानी पुलिस नियंत्रण डेस्क",
        department_cg: "राजधानी पुलिस नियंत्रण डेस्क",
        number: "112 / +91-771-2424240", 
        scope: "General crime & safety violations", 
        scope_hi: "सामान्य अपराध और सुरक्षा उल्लंघन",
        scope_cg: "सामान्य अपराध अउ सुरक्षा उल्लंघन",
        notes: "Naya Raipur HQ Desk",
        notes_hi: "नया रायपुर मुख्यालय डेस्क",
        notes_cg: "नवा रायपुर मुख्यालय डेस्क"
      },
      { 
        department: "Raipur Main Medical Trauma Center", 
        department_hi: "रायपुर मुख्य चिकित्सा ट्रॉमा सेंटर",
        department_cg: "रायपुर मुख्य चिकित्सा ट्रॉमा सेंटर",
        number: "+91-771-2235600", 
        scope: "High-grade surgery and medical trauma", 
        scope_hi: "उच्च श्रेणी की सर्जरी और चिकित्सा आघात",
        scope_cg: "बड़ी सर्जरी अउ चिकित्सा आघात",
        notes: "AIIMS Raipur Emergency Desk",
        notes_hi: "एम्स रायपुर आपातकालीन डेस्क",
        notes_cg: "एम्स रायपुर आपातकालीन डेस्क"
      },
      { 
        department: "State Forest Conservation Command", 
        department_hi: "राज्य वन संरक्षण कमान",
        department_cg: "राज्य वन संरक्षण कमान",
        number: "+91-771-2443200", 
        scope: "State-wide wilderness coordination", 
        scope_hi: "राज्यव्यापी जंगल सुरक्षा समन्वय",
        scope_cg: "पूरा राज्य म जंगल सुरक्षा समन्वय",
        notes: "Aranya Bhavan Office",
        notes_hi: "अरण्य भवन कार्यालय",
        notes_cg: "अरण्य भवन कार्यालय"
      }
    ],
    bilaspur: [
      { 
        department: "Bilaspur City Police Desk", 
        department_hi: "बिलासपुर शहर पुलिस डेस्क",
        department_cg: "बिलासपुर शहर पुलिस डेस्क",
        number: "+91-7752-223333", 
        scope: "General law enforcement", 
        scope_hi: "सामान्य कानून प्रवर्तन",
        scope_cg: "सामान्य कानून व्यवस्था",
        notes: "Civil Lines Station",
        notes_hi: "सिविल लाइन्स स्टेशन",
        notes_cg: "सिविल लाइन्स स्टेशन"
      },
      { 
        department: "CIMS Government Medical College", 
        department_hi: "सिम्स सरकारी मेडिकल कॉलेज",
        department_cg: "सिम्स सरकारी मेडिकल कॉलेज",
        number: "+91-7752-224350", 
        scope: "Critical healthcare emergencies", 
        scope_hi: "गंभीर स्वास्थ्य आपात स्थिति",
        scope_cg: "गंभीर बीमारी अउ आपात स्थिति",
        notes: "Bilaspur Center",
        notes_hi: "बिलासपुर केंद्र",
        notes_cg: "बिलासपुर केंद्र"
      },
      { 
        department: "Achanakmar Biosphere Rescue Force", 
        department_hi: "अचानकमार बायोस्फीयर बचाव बल",
        department_cg: "अचानकमार बायोस्फीयर बचाव बल",
        number: "+91-7752-253400", 
        scope: "Forestry hazard & wildlife tracking", 
        scope_hi: "वानिकी खतरा और वन्यजीव ट्रैकिंग",
        scope_cg: "जंगल के खतरा अउ जंगली जीव खोज",
        notes: "Achanakmar Entrance Desk",
        notes_hi: "अचानकमार प्रवेश डेस्क",
        notes_cg: "अचानकमार प्रवेश डेस्क"
      }
    ]
  };

  const activeReports: IncidentReport[] = [
    {
      district: "Bastar",
      hazardType: "flood",
      location: "Indravati River Base near Chitrakote Gorge",
      location_hi: "चित्रकोट कण्ठ के पास इंद्रावती नदी बेस",
      location_cg: "चित्रकोट तीर इंद्रावती नदी बेस",
      severity: "high",
      timestamp: "10 mins ago",
      timestamp_hi: "10 मिनट पहले",
      timestamp_cg: "10 मिनट पहिली",
      message: "Sudden rise in monsoon pool levels. Boating strictly prohibited inside the canyon base. Tourist stairs closed.",
      message_hi: "मानसून के जलस्तर में अचानक वृद्धि। कण्ठ के भीतर नौकायन पूर्णतः प्रतिबंधित। पर्यटक सीढ़ियाँ बंद।",
      message_cg: "चौमास म पानी के स्तर ह अचानक बढ़ गे हे। कण्ठ के भीतर नाव चलाना मना हे। पर्यटक मन के सीढ़ी बंद हे।"
    },
    {
      district: "Kawardha",
      hazardType: "weather",
      location: "Maikal Hills surrounding Bhoramdeo",
      location_hi: "भोरमदेव के आस-पास मैकल पहाड़ियाँ",
      location_cg: "भोरमदेव के तीर-तखार मैकल पहाड़ी",
      severity: "moderate",
      timestamp: "1 hour ago",
      timestamp_hi: "1 घंटे पहले",
      timestamp_cg: "1 घंटा पहिली",
      message: "Heavy misty rain limiting visibility to less than 15 meters on local mountain road cuts. Exercise extreme caution.",
      message_hi: "भारी कोहरे वाली बारिश के कारण स्थानीय पहाड़ी रास्तों पर दृश्यता 15 मीटर से कम। अत्यधिक सावधानी बरतें।",
      message_cg: "भारी धुंध अउ पानी गिरे के कारण पहाड़ी रद्दा म 15 मीटर से कम दिखत हे। बहुत सावधानी राखव।"
    },
    {
      district: "Bilaspur",
      hazardType: "fire",
      location: "Achanakmar Tiger Reserve buffer zone",
      location_hi: "अचानकमार टाइगर रिजर्व बफर जोन",
      location_cg: "अचानकमार टाइगर रिजर्व बफर जोन",
      severity: "low",
      timestamp: "3 hours ago",
      timestamp_hi: "3 घंटे पहले",
      timestamp_cg: "3 घंटा पहिली",
      message: "Localized dry teak leaf controlled forest clearing. No active threat to marked tourist vehicle corridors.",
      message_hi: "स्थानीय सूखे सागौन के पत्तों की नियंत्रित वन सफाई। चिह्नित पर्यटक वाहन गलियारों के लिए कोई सक्रिय खतरा नहीं।",
      message_cg: "सूखा सागौन पत्ता मन के नियंत्रित सफाई चलत हे। पर्यटक मन के गाड़ी रद्दा बर कोई खतरा नइ हे।"
    }
  ];

  const handleSOSTrigger = () => {
    setSosTriggered(!sosTriggered);
  };

  const getLocalizedVal = (en: string, hi?: string, cg?: string) => {
    if (lang === "hi" && hi) return hi;
    if (lang === "cg" && cg) return cg;
    return en;
  };

  const handleListenBulletin = (report: IncidentReport, idx: number) => {
    if (isSpeaking && speakingReportIndex === idx) {
      stopSpeaking();
      setSpeakingReportIndex(null);
    } else {
      stopSpeaking();
      const loc = getLocalizedVal(report.location, report.location_hi, report.location_cg);
      const msg = getLocalizedVal(report.message, report.message_hi, report.message_cg);
      speakText(`${loc}. ${msg}`);
      setSpeakingReportIndex(idx);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-charcoal-stone/10 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-300 bg-red-100 text-xs font-mono font-bold text-red-700 w-fit uppercase">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          {t("sos.cockpit")}
        </span>
        <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-red-700">
          {t("sos.title")}
        </h1>
        <p className="text-sm text-charcoal-stone/60 max-w-xl leading-relaxed">
          {t("sos.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: SOS Button and Women Safety Sharing panel */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* URGENT SOS ACTUATOR BOARD */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-200/50 shadow-xl flex flex-col items-center text-center gap-6 relative overflow-hidden bg-red-500/5">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"></div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-widest">{t("sos.dispatch_subtitle")}</span>
              <h2 className="text-2xl font-sans font-bold text-charcoal-stone">{t("sos.dispatch_title")}</h2>
              <p className="text-xs text-charcoal-stone/65 max-w-md">
                {t("sos.dispatch_desc")}
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
                {sosTriggered ? t("sos.sos_active") : t("sos.sos_switch")}
              </span>
            </button>

            {sosTriggered && (
              <div className="p-4 rounded-2xl bg-red-600 text-white flex items-center gap-3 animate-pulse text-left w-full">
                <Activity className="w-6 h-6 shrink-0 text-white" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold uppercase">{t("sos.broadcasting_telemetry")}</span>
                  <span className="text-[10px] text-white/80">
                    {t("sos.broadcasting_desc")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* WOMEN SAFETY & EMERGENCY SHARING SYSTEM */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col gap-6">
            <h3 className="font-sans font-bold text-lg text-forest-emerald flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-forest-emerald" />
              {t("sos.women_safety_title")}
            </h3>
            <p className="text-xs text-charcoal-stone/65 leading-relaxed">
              {t("sos.women_safety_desc")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-3">
                <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{t("sos.corridor_coords")}</span>
                <div className="flex flex-col gap-1 text-xs text-charcoal-stone">
                  <span>{t("sos.corridor_start")}: <strong>{getLocalizedVal("Jagdalpur Town Gate", "जगदलपुर टाउन गेट", "जगदलपुर शहर फाटक")}</strong></span>
                  <span>{t("sos.corridor_destination")}: <strong>{getLocalizedVal("Tirathgarh Falls Basin", "तीरथगढ़ जलप्रपात बेसिन", "तीरथगढ़ जलप्रपात कुंड")}</strong></span>
                  <span>{t("sos.corridor_transit")}: <strong>{getLocalizedVal("45 mins", "45 मिनट", "45 मिनट")}</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col justify-between gap-3">
                <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{t("sos.profile_trustee")}</span>
                <span className="text-xs text-charcoal-stone/85 leading-tight">
                  {t("sos.linked_guardian")}
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
                  {safetyShared ? t("sos.corridor_synced") : t("sos.sync_corridor")}
                </button>
              </div>
            </div>

            {safetyShared && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-green-700 shrink-0 mt-0.5" />
                <span>
                  {t("sos.sync_success")}
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
              {t("sos.offline_directory")}
            </h3>
            
            {/* District Selector Chips */}
            <div className="flex gap-2 border-b border-charcoal-stone/10 pb-3">
              {[
                { id: "bastar", label: t("sos.bastar") },
                { id: "raipur", label: t("sos.raipur") },
                { id: "bilaspur", label: t("sos.bilaspur") }
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
              {emergencyContacts[activeDistrict].map((contact, index) => {
                const dept = getLocalizedVal(contact.department, contact.department_hi, contact.department_cg);
                const scope = getLocalizedVal(contact.scope, contact.scope_hi, contact.scope_cg);
                const notes = getLocalizedVal(contact.notes, contact.notes_hi, contact.notes_cg);
                return (
                  <div key={index} className="p-3.5 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-1.5 animate-fadeIn">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-sans font-bold text-xs text-forest-emerald leading-tight">{dept}</span>
                      <span className="text-[8px] font-mono bg-charcoal-stone/5 text-charcoal-stone/60 px-1.5 py-0.5 rounded uppercase shrink-0">
                        {notes.split(" ")[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-charcoal-stone/50 font-sans leading-tight">
                      {scope}
                    </span>
                    <a 
                      href={`tel:${contact.number}`}
                      className="text-xs font-mono font-bold text-tribal-terracotta hover:underline inline-flex items-center gap-1.5 mt-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-tribal-terracotta shrink-0" />
                      {contact.number}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE DISASTER WARNING BULLETINS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              {t("sos.forestry_bulletins")}
            </h3>

            <div className="flex flex-col gap-3">
              {activeReports.map((report, idx) => {
                const timestamp = getLocalizedVal(report.timestamp, report.timestamp_hi, report.timestamp_cg);
                const location = getLocalizedVal(report.location, report.location_hi, report.location_cg);
                const message = getLocalizedVal(report.message, report.message_hi, report.message_cg);
                
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-1.5 relative overflow-hidden">
                    
                    {/* Warning Strip */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                      report.severity === "high" ? "bg-red-600" : report.severity === "moderate" ? "bg-amber-500" : "bg-green-500"
                    }`}></div>

                    <div className="flex justify-between items-center pl-1.5 pr-20">
                      <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{timestamp}</span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-1.5 rounded ${
                        report.severity === "high" ? "bg-red-100 text-red-600" : report.severity === "moderate" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                      }`}>
                        {t(`sos.severity_${report.severity}`)} {t("sos.alert")}
                      </span>
                    </div>

                    {/* Audio Narration for Bulletin */}
                    <button
                      onClick={() => handleListenBulletin(report, idx)}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer ${
                        isSpeaking && speakingReportIndex === idx
                          ? "bg-red-600 border-red-700 text-white animate-pulse"
                          : "bg-forest-emerald border-forest-emerald/10 text-sand-beige hover:bg-tribal-terracotta"
                      }`}
                      aria-label={isSpeaking && speakingReportIndex === idx ? "Stop Listening" : "Listen Bulletin"}
                    >
                      {isSpeaking && speakingReportIndex === idx ? (
                        <span className="flex items-center gap-1">
                          <VolumeX className="w-3 h-3" /> {t("sos.stop_listen_bulletin")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> {t("sos.listen_bulletin")}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5 pl-1.5 text-xs text-charcoal-stone font-bold pr-20">
                      {report.hazardType === "flood" && <Droplet className="w-3.5 h-3.5 text-blue-600" />}
                      {report.hazardType === "fire" && <Flame className="w-3.5 h-3.5 text-orange-600" />}
                      {report.hazardType === "weather" && <CloudRain className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{location.split("near")[0]}</span>
                    </div>

                    <p className="text-[10px] text-charcoal-stone/60 leading-relaxed pl-1.5 pr-4">
                      {message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

