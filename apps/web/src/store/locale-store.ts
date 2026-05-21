import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'hi' | 'cg';

export const translations = {
  en: {
    navMapDiscovery: "Map Discovery",
    navPlanner: "AI Planner",
    navCreator: "Creator Studio",
    navSaved: "Saved Journeys",
    navStories: "Folklore Stories",
    navEmergency: "Emergency SOS",
    brandTitle: "CG TOURISM OS",
    brandSubtitle: "Explore the Real",
    planTrip: "Plan Trip",
    govtPortal: "Govt Portal",
    logIn: "Log In",
    signUp: "Sign Up",
    logOut: "Log Out",
    welcome: "Welcome",
    welcomeDesc: "Digitizing Chhattisgarh's rich tribal narratives, natural bio-reserves, and heritage corridors.",
    exploreBtn: "Explore Map",
    // Creator studio
    creatorTitle: "Verified Contributor Studio",
    creatorSubtitle: "Empowering local communities, photographers, and forest experts to expand the platform's footprint organically while respecting tribal sovereignty.",
    creatorLink: "Link Contributor Credential",
    creatorSelectRole: "Select Role Classification",
    creatorSocialLink: "Primary Social Link / ID",
    creatorVerifyBtn: "Verify Identity",
    creatorVerifying: "Verifying Social Registry...",
    creatorAddCoords: "Add New Coordinates",
    creatorFormSuccess: "Place Dispatch Complete! Sent directly to the State Administrative Moderation Queue.",
    creatorLocName: "Location Name",
    creatorTagline: "One-line Tagline",
    creatorDistrict: "District",
    creatorCategory: "Experience Category",
    creatorMapX: "Vector Map X Coordinate (0-100%)",
    creatorMapY: "Vector Map Y Coordinate (0-100%)",
    creatorDescription: "Story overview / description",
    creatorBestSeason: "Peak Visiting Months / Season",
    creatorRules: "Respect & Eco Rule",
    creatorSafety: "Live Safety Warnings",
    creatorFolklore: "Folklore Story Narrative (If Any)",
    creatorGear: "Gear Checklists (Comma separated)",
    creatorSubmitBtn: "Submit Coordinates",
    creatorSubmittedList: "Submitted Coordinates",
    creatorNoSubmissions: "No submissions filed yet",
    creatorPendingVerification: "Your Creator Profile registration is pending administrative review. You can draft details below."
  },
  hi: {
    navMapDiscovery: "मानचित्र खोज",
    navPlanner: "एआई योजनाकार",
    navCreator: "क्रिएटर स्टूडियो",
    navSaved: "सुरक्षित यात्राएं",
    navStories: "लोककथाएं",
    navEmergency: "आपातकालीन एसओएस",
    brandTitle: "सीजी टूरिज्म ओएस",
    brandSubtitle: "वास्तविकता का अन्वेषण करें",
    planTrip: "यात्रा योजना",
    govtPortal: "सरकारी पोर्टल",
    logIn: "लॉग इन",
    signUp: "साइन अप",
    logOut: "लॉग आउट",
    welcome: "स्वागत है",
    welcomeDesc: "छत्तीसगढ़ के समृद्ध आदिवासी आख्यानों, प्राकृतिक जैव-भंडारों और विरासत गलियारों का डिजिटलीकरण।",
    exploreBtn: "मानचित्र देखें",
    // Creator studio
    creatorTitle: "सत्यापित योगदानकर्ता स्टूडियो",
    creatorSubtitle: "आदिवासी संप्रभुता का सम्मान करते हुए मंच के भौगोलिक पदचिह्न का विस्तार करने के लिए स्थानीय समुदायों, फोटोग्राफरों और वन विशेषज्ञों को सशक्त बनाना।",
    creatorLink: "योगदानकर्ता क्रेडेंशियल लिंक करें",
    creatorSelectRole: "भूमिका वर्गीकरण का चयन करें",
    creatorSocialLink: "प्राथमिक सोशल लिंक / आईडी",
    creatorVerifyBtn: "पहचान सत्यापित करें",
    creatorVerifying: "सोशल रजिस्ट्री सत्यापित की जा रही है...",
    creatorAddCoords: "नए निर्देशांक जोड़ें",
    creatorFormSuccess: "स्थान प्रेषण पूरा हुआ! सीधे राज्य प्रशासनिक मॉडरेशन कतार में भेजा गया।",
    creatorLocName: "स्थान का नाम",
    creatorTagline: "एक पंक्ति की टैगलाइन",
    creatorDistrict: "जिला",
    creatorCategory: "अनुभव श्रेणी",
    creatorMapX: "वेक्टर मानचित्र X निर्देशांक (0-100%)",
    creatorMapY: "वेक्टर मानचित्र Y निर्देशांक (0-100%)",
    creatorDescription: "कहानी का अवलोकन / विवरण",
    creatorBestSeason: "सर्वोत्तम दौरा महीना / मौसम",
    creatorRules: "सम्मान और पर्यावरण नियम",
    creatorSafety: "लाइव सुरक्षा चेतावनियाँ",
    creatorFolklore: "लोककथा कहानी (यदि कोई हो)",
    creatorGear: "गियर चेकलिस्ट (अल्पविराम से अलग)",
    creatorSubmitBtn: "निर्देशांक जमा करें",
    creatorSubmittedList: "जमा किए गए निर्देशांक",
    creatorNoSubmissions: "अभी तक कोई प्रविष्टि दर्ज नहीं की गई है",
    creatorPendingVerification: "आपका क्रिएटर प्रोफ़ाइल पंजीकरण प्रशासनिक समीक्षा के अधीन है। आप नीचे विवरण लिख सकते हैं।"
  },
  cg: {
    navMapDiscovery: "नक्शा खोज",
    navPlanner: "एआई योजनाकार",
    navCreator: "क्रिएटर स्टूडियो",
    navSaved: "सुरक्षित रखाय जात्रा",
    navStories: "लोककथा मन",
    navEmergency: "आपातकालीन एसओएस",
    brandTitle: "सीजी टूरिज्म ओएस",
    brandSubtitle: "असली छत्तीसगढ़ देखव",
    planTrip: "जात्रा योजना",
    govtPortal: "सरकारी पोर्टल",
    logIn: "लॉग इन",
    signUp: "साइन अप",
    logOut: "लॉग आउट",
    welcome: "जौहार छत्तीसगढ़",
    welcomeDesc: "छत्तीसगढ़ के आदिवासी कहानी मन, सुंदर जंगल अउ धरोहर रस्ता मन ला कम्प्यूटर म दर्ज करना।",
    exploreBtn: "नक्शा देखव",
    // Creator studio
    creatorTitle: "सत्यापित संगवारी स्टूडियो",
    creatorSubtitle: "हमर आदिवासी संप्रभुता के सम्मान करत, छत्तीसगढ़ के सुंदर जगा मन ला दुनिया ला देखाए बर हमर गाँव-घर के संगवारी, फोटोग्राफर अउ जंगल के जानकार मन ला बढ़ावा देना।",
    creatorLink: "संगवारी पहिचान जोड़व",
    creatorSelectRole: "अपन काम चुनव",
    creatorSocialLink: "अपन सोशल लिंक या आईडी लिखव",
    creatorVerifyBtn: "पहिचान सत्यापित करव",
    creatorVerifying: "पहिचान जांचे जात हे...",
    creatorAddCoords: "नवा जगा के जानकारी जोड़व",
    creatorFormSuccess: "जगा के जानकारी भेज दे गेहे! अब सरकारी अधिकारी मन एकर जांच करिहिन।",
    creatorLocName: "जगा के नाम",
    creatorTagline: "एक लाइन में परिचय",
    creatorDistrict: "जिला",
    creatorCategory: "कइसन जगा हे",
    creatorMapX: "नक्शा में X जगा (0-100%)",
    creatorMapY: "नक्शा में Y जगा (0-100%)",
    creatorDescription: "कहानी या पूरा विवरण",
    creatorBestSeason: "घूमे के बढ़िया समय अउ मौसम",
    creatorRules: "मान-मर्यादा अउ जंगल के नियम",
    creatorSafety: "सुरक्षा के चेतावनी",
    creatorFolklore: "पुरानी लोककथा या गोठ (यदि कोनो होवय)",
    creatorGear: "ज़रूरी समान के लिस्ट (कोमा लगा के)",
    creatorSubmitBtn: "जानकारी जमा करव",
    creatorSubmittedList: "भेजे गे जगा मन",
    creatorNoSubmissions: "अभी तक कोनो जगा नई भेजे गेहे",
    creatorPendingVerification: "तुहर क्रिएटर खाता अभी जांच म हे। तब तक तुमन नवा जगा के जानकारी लिख सकथौ।"
  }
};

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      t: (key) => {
        const currentLocale = get().locale;
        return translations[currentLocale][key] || translations['en'][key] || '';
      }
    }),
    {
      name: 'cg-tourism-locale',
    }
  )
);
