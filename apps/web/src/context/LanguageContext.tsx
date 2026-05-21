"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import enLocale from "../locales/en/common.json";
import hiLocale from "../locales/hi/common.json";
import cgLocale from "../locales/cg/common.json";

export type Language = "en" | "hi" | "cg";

interface LanguageContextProps {
  lang: Language;
  changeLanguage: (newLang: Language) => void;
  t: (key: string) => string;
  isListening: boolean;
  startVoiceListening: (onSuccessText?: string) => void;
  stopVoiceListening: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  voiceResult: string;
  voiceErrorMsg: string;
}

const locales: Record<Language, any> = {
  en: enLocale,
  hi: hiLocale,
  cg: cgLocale,
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Web Speech API interfaces
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("en");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceResult, setVoiceResult] = useState("");
  const [voiceErrorMsg, setVoiceErrorMsg] = useState("");
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Initialize and detect language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_language") as Language | null;
      if (saved && ["en", "hi", "cg"].includes(saved)) {
        setLang(saved);
      } else {
        // Detect device/browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("hi")) {
          setLang("hi");
        } else if (browserLang.startsWith("en")) {
          setLang("en");
        } else {
          // Default fallback is Hindi as requested for regional accessibility layer
          setLang("hi");
        }
      }
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", newLang);
    }
    // Cancel any active TTS speech upon switching language
    stopSpeaking();
  };

  // Translation function helper
  const t = (key: string): string => {
    const keys = key.split(".");
    let currentVal = locales[lang];
    for (const k of keys) {
      currentVal = currentVal?.[k];
    }

    if (currentVal && typeof currentVal === "string") {
      return currentVal;
    }

    // Fallback to English
    let fallbackVal = locales["en"];
    for (const k of keys) {
      fallbackVal = fallbackVal?.[k];
    }

    return fallbackVal && typeof fallbackVal === "string" ? fallbackVal : key;
  };

  // Text-To-Speech (TTS) Speaker
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any active speaker first
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    // Use proper Indic accent for hi & cg, standard English for en
    utterance.lang = lang === "en" ? "en-IN" : "hi-IN";

    // Detect voices and bind suitable voice
    const voices = window.speechSynthesis.getVoices();
    const chosenVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(lang === "en" ? "en" : "hi")
    );
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Voice Assistant (Speech-to-Text Recognition and Command Router)
  const startVoiceListening = () => {
    if (!SpeechRecognition) {
      setVoiceErrorMsg(t("home.voice_not_supported"));
      return;
    }

    // Cancel existing speaker to prevent feedback loop
    stopSpeaking();

    try {
      const rec = new SpeechRecognition();
      rec.lang = lang === "en" ? "en-US" : "hi-IN"; // Use Hindi engine for both Hindi & Chhattisgarhi queries
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListening(true);
        setVoiceResult("");
        setVoiceErrorMsg("");
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceResult(text);
        processVoiceCommand(text);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setVoiceErrorMsg(t("home.voice_error"));
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
      setRecognitionInstance(rec);
    } catch (e) {
      console.error(e);
      setVoiceErrorMsg(t("home.voice_error"));
      setIsListening(false);
    }
  };

  const stopVoiceListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
    }
    setIsListening(false);
  };

  // Advanced Voice Commands Processing Pipeline
  const processVoiceCommand = (command: string) => {
    console.log("Processing command:", command);

    // 1. Destination Navigation matches
    if (
      command.includes("चित्रकोट") ||
      command.includes("chitrakote") ||
      command.includes("horseshoe") ||
      command.includes("झरना")
    ) {
      speakText(lang === "en" ? "Opening Chitrakote Falls" : lang === "cg" ? "चित्रकोट जलप्रपात ला खोलत हंव" : "चित्रकोट जलप्रपात खोल रहा हूँ");
      router.push("/destination/chitrakote-falls");
      return;
    }

    if (
      command.includes("सिरपुर") ||
      command.includes("sirpur") ||
      command.includes("धरोहर")
    ) {
      speakText(lang === "en" ? "Opening Sirpur Monuments" : lang === "cg" ? "सिरपुर धरोहर ला खोलत हंव" : "सिरपुर धरोहर स्थल खोल रहा हूँ");
      router.push("/destination/sirpur-monuments");
      return;
    }

    if (
      command.includes("भोरमदेव") ||
      command.includes("bhoramdeo") ||
      command.includes("मंदिर")
    ) {
      speakText(lang === "en" ? "Opening Bhoramdeo Temple" : lang === "cg" ? "भोरमदेव मंदिर ला खोलत हंव" : "भोरमदेव मंदिर खोल रहा हूँ");
      router.push("/destination/bhoramdeo-temple");
      return;
    }

    if (
      command.includes("कांगेर") ||
      command.includes("kanger") ||
      command.includes("कुटुमसर") ||
      command.includes("kutumsar") ||
      command.includes("गुफा")
    ) {
      speakText(lang === "en" ? "Opening Kanger Valley National Park" : lang === "cg" ? "कांगेर घाटी राष्ट्रीय उद्यान ला खोलत हंव" : "कांगेर घाटी राष्ट्रीय उद्यान खोल रहा हूँ");
      router.push("/destination/kanger-valley");
      return;
    }

    if (
      command.includes("तीरथगढ़") ||
      command.includes("tirathgarh")
    ) {
      speakText(lang === "en" ? "Opening Tirathgarh Waterfalls" : lang === "cg" ? "तीरथगढ़ जलप्रपात ला खोलत हंव" : "तीरथगढ़ जलप्रपात खोल रहा हूँ");
      router.push("/destination/tirathgarh-falls");
      return;
    }

    if (
      command.includes("बारनवापारा") ||
      command.includes("barnawapara") ||
      command.includes("अभयारण्य")
    ) {
      speakText(lang === "en" ? "Opening Barnawapara Sanctuary" : lang === "cg" ? "बारनवापारा वन्यजीव अभयारण्य ला खोलत हंव" : "बारनवापारा वन्यजीव अभयारण्य खोल रहा हूँ");
      router.push("/destination/barnawapara");
      return;
    }

    if (
      command.includes("अचानकमार") ||
      command.includes("achanakmar") ||
      command.includes("टाइगर")
    ) {
      speakText(lang === "en" ? "Opening Achanakmar Tiger Reserve" : lang === "cg" ? "अचानकमार टाइगर रिजर्व ला खोलत हंव" : "अचानकमार टाइगर रिजर्व खोल रहा हूँ");
      router.push("/destination/achanakmar");
      return;
    }

    if (
      command.includes("गंगरेल") ||
      command.includes("gangrel") ||
      command.includes("बांध")
    ) {
      speakText(lang === "en" ? "Opening Gangrel Dam" : lang === "cg" ? "गंगरेल बांध ला खोलत हंव" : "गंगरेल बांध खोल रहा हूँ");
      router.push("/destination/gangrel-dam");
      return;
    }

    // 2. Navigation Actions
    if (
      command.includes("नक्शा") ||
      command.includes("map") ||
      command.includes("explore") ||
      command.includes("खोज")
    ) {
      speakText(lang === "en" ? "Opening Discovery Map" : lang === "cg" ? "नक्शा खोज ला खोलत हंव" : "मानचित्र खोज खोल रहा हूँ");
      router.push("/explore");
      return;
    }

    if (
      command.includes("सुरक्षा") ||
      command.includes("आपात") ||
      command.includes("sos") ||
      command.includes("emergency")
    ) {
      speakText(lang === "en" ? "Opening Safety SOS Panel" : lang === "cg" ? "आपातकालीन सुरक्षा ला खोलत हंव" : "आपातकालीन सुरक्षा खोल रहा हूँ");
      router.push("/sos");
      return;
    }

    if (
      command.includes("कहानी") ||
      command.includes("stories") ||
      command.includes("folklore") ||
      command.includes("पुरखा")
    ) {
      speakText(lang === "en" ? "Opening Folklore Stories" : lang === "cg" ? "पुरखा कहानी मन ला खोलत हंव" : "लोककथाएं खोल रहा हूँ");
      router.push("/stories");
      return;
    }

    if (
      command.includes("प्लानर") ||
      command.includes("planner") ||
      command.includes("योजना")
    ) {
      speakText(lang === "en" ? "Opening AI Trip Planner" : lang === "cg" ? "घूमइ के योजना ला खोलत हंव" : "यात्रा प्लानर खोल रहा हूँ");
      router.push("/planner");
      return;
    }

    // 3. Geolocation action triggers
    if (
      command.includes("नजदीक") ||
      command.includes("नज़दीक") ||
      command.includes("nearby") ||
      command.includes("तीर") ||
      command.includes("पास")
    ) {
      speakText(lang === "en" ? "Triggering location search" : lang === "cg" ? "तीर-तखार के लोकेशन खोजत हंव" : "निकटतम पर्यटन स्थल खोज रहा हूँ");
      // Find geo button and click it dynamically
      const geoBtn = document.getElementById("geo-trigger-btn");
      if (geoBtn) {
        geoBtn.click();
      }
      return;
    }

    // Command unrecognized
    speakText(
      lang === "en"
        ? `No results for ${command}`
        : lang === "cg"
        ? `${command} बर कुछ नइ मिलिस`
        : `${command} के लिए कोई परिणाम नहीं मिला`
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        changeLanguage,
        t,
        isListening,
        startVoiceListening,
        stopVoiceListening,
        speakText,
        stopSpeaking,
        isSpeaking,
        voiceResult,
        voiceErrorMsg,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
