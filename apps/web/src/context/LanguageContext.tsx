"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
  accessibilityMode: boolean;
  toggleAccessibilityMode: () => void;
  tDynamic: (entityId: string, field: string, fallback: string) => string;
  dynamicTranslations: Record<string, Record<string, string>>;
  isLoadingTranslations: boolean;
  isPlayingAudio: boolean;
  audioProgress: number;
  audioDuration: number;
  audioNarrator: string | null;
  playAudioFile: (url: string, narratorName?: string | null) => void;
  pauseAudioFile: () => void;
  stopAudioFile: () => void;
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
  
  // Accessibility and Dynamic Translations state
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, Record<string, string>>>({});
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);

  // Audio Playback state and reference
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioNarrator, setAudioNarrator] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to load dynamic translations from local cache
  const loadCachedTranslations = useCallback((targetLang: Language) => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`dynamic_translations_${targetLang}`);
        if (cached) {
          setDynamicTranslations(JSON.parse(cached));
        } else {
          setDynamicTranslations({});
        }
      } catch (err) {
        console.error("Failed to parse cached translations", err);
      }
    }
  }, []);

  // Fetch dynamic translations from backend with fallback
  const fetchTranslations = useCallback(async (targetLang: Language) => {
    if (targetLang === "en") {
      setDynamicTranslations({});
      return;
    }

    setIsLoadingTranslations(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    try {
      const res = await fetch(`${apiBase}/translations?lang=${targetLang}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setDynamicTranslations(data);
      if (typeof window !== "undefined") {
        localStorage.setItem(`dynamic_translations_${targetLang}`, JSON.stringify(data));
      }
    } catch (err) {
      console.warn(`Translation fetch failed for ${targetLang}. Using local cache fallback if available.`, err);
      loadCachedTranslations(targetLang);
    } finally {
      setIsLoadingTranslations(false);
    }
  }, [loadCachedTranslations]);

  // Initialize and detect language/settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Detect language preferences
      const savedLang = localStorage.getItem("preferred_language") as Language | null;
      let detectedLang: Language = "en";
      if (savedLang && ["en", "hi", "cg"].includes(savedLang)) {
        detectedLang = savedLang;
      } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("hi")) {
          detectedLang = "hi";
        } else if (browserLang.startsWith("en")) {
          detectedLang = "en";
        } else {
          detectedLang = "hi"; // Default fallback
        }
      }
      setLang(detectedLang);
      loadCachedTranslations(detectedLang);
      fetchTranslations(detectedLang);

      // 2. Detect accessibility mode settings
      const savedAccessibility = localStorage.getItem("accessibility_mode") === "true";
      setAccessibilityMode(savedAccessibility);

      // 3. Register Progressive Web App Service Worker
      if ("serviceWorker" in navigator) {
        const registerSW = () => {
          navigator.serviceWorker.register("/sw.js")
            .then((registration) => {
              console.log("ServiceWorker registered successfully with scope:", registration.scope);
            })
            .catch((err) => {
              console.error("ServiceWorker registration failed:", err);
            });
        };

        if (document.readyState === "complete") {
          registerSW();
        } else {
          window.addEventListener("load", registerSW);
          return () => window.removeEventListener("load", registerSW);
        }
      }
    }
  }, [loadCachedTranslations, fetchTranslations]);

  // Apply typography classes and accessibility styles on body
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("accessibility-mode", accessibilityMode);
    }
  }, [accessibilityMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.remove("lang-en", "lang-hi", "lang-cg");
      document.body.classList.add(`lang-${lang}`);
    }
  }, [lang]);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_language", newLang);
    }
    // Cancel any active TTS speech upon switching language
    stopSpeaking();
    // Stop any active pre-recorded audio
    stopAudioFile();
    // Load cached and fetch fresh database translations
    loadCachedTranslations(newLang);
    fetchTranslations(newLang);
  };

  const toggleAccessibilityMode = () => {
    const nextMode = !accessibilityMode;
    setAccessibilityMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("accessibility_mode", nextMode ? "true" : "false");
    }
  };

  // Dynamic localization utility for DB-driven elements
  const tDynamic = (entityId: string, field: string, fallbackText: string): string => {
    const translation = dynamicTranslations[entityId]?.[field];
    if (translation) return translation;
    return fallbackText;
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

    stopAudioFile(); // Stop any active pre-recorded audio guide
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

  const playAudioFile = useCallback((url: string, narratorName?: string | null) => {
    // 1. Cancel TTS first
    stopSpeaking();

    if (typeof window === "undefined") return;

    // 2. Manage native Audio
    if (audioRef.current) {
      // If same URL, just toggle play/pause
      if (audioRef.current.src.endsWith(url)) {
        audioRef.current.play().catch((err) => console.warn("Failed to play audio:", err));
        setIsPlayingAudio(true);
        if (narratorName) setAudioNarrator(narratorName);
        return;
      } else {
        // Stop current audio first
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }

    setAudioNarrator(narratorName || null);
    const newAudio = new Audio(url);
    audioRef.current = newAudio;

    newAudio.addEventListener("play", () => setIsPlayingAudio(true));
    newAudio.addEventListener("pause", () => setIsPlayingAudio(false));
    newAudio.addEventListener("ended", () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    });
    newAudio.addEventListener("timeupdate", () => {
      setAudioProgress(newAudio.currentTime);
    });
    newAudio.addEventListener("loadedmetadata", () => {
      setAudioDuration(newAudio.duration);
    });

    newAudio.play().catch((err) => console.warn("Audio play failed:", err));
  }, []);

  const pauseAudioFile = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  }, []);

  const stopAudioFile = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioProgress(0);
    }
  }, []);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
        accessibilityMode,
        toggleAccessibilityMode,
        tDynamic,
        dynamicTranslations,
        isLoadingTranslations,
        isPlayingAudio,
        audioProgress,
        audioDuration,
        audioNarrator,
        playAudioFile,
        pauseAudioFile,
        stopAudioFile,
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
