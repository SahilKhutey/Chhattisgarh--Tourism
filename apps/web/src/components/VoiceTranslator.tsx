"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, X, RefreshCw, Languages, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function VoiceTranslator() {
  const { lang, speakText, stopSpeaking } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Translation state
  const [sourceLang, setSourceLang] = useState<"en" | "hi">("en");
  const [targetLang, setTargetLang] = useState<"en" | "hi" | "cg">("hi");
  
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListening(true);
        setErrorMsg("");
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        setSourceText(currentText);

        // If we got a final result, trigger translation
        if (finalTranscript) {
          handleTranslation(finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error !== "no-speech") {
          setErrorMsg("Could not understand audio. Please try again.");
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [sourceLang]); // Re-init when source language changes

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        setSourceText("");
        setTranslatedText("");
        setErrorMsg("");
        stopSpeaking();
        
        // Set language based on sourceLang selection
        recognitionRef.current.lang = sourceLang === "en" ? "en-US" : "hi-IN";
        
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error("Failed to start listening", err);
        }
      } else {
        setErrorMsg("Voice recognition is not supported in this browser.");
      }
    }
  };

  const handleTranslation = async (text: string) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    
    try {
      const res = await fetch(`${apiBase}/translations/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang
        })
      });
      
      if (!res.ok) throw new Error("Translation failed");
      
      const data = await res.json();
      const translation = data.data?.translatedText || "Translation unavailable";
      
      setTranslatedText(translation);
      
      // Auto-speak the translated text
      speakText(translation);
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to translation service.");
    } finally {
      setIsTranslating(false);
    }
  };

  const playTranslation = () => {
    if (translatedText) {
      speakText(translatedText);
    }
  };

  const swapLanguages = () => {
    if (targetLang === "cg") {
      // If CG is target, we can't swap because speech recognition doesn't natively support CG.
      // We would swap it to Hindi instead.
      setSourceLang("hi");
      setTargetLang("en");
    } else {
      const newSource = targetLang as "en" | "hi";
      const newTarget = sourceLang as "en" | "hi";
      setSourceLang(newSource);
      setTargetLang(newTarget);
    }
    setSourceText("");
    setTranslatedText("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 bg-forest-emerald border-forest-emerald/20 text-sand-beige hover:bg-tribal-terracotta"
          title="Live Voice Translator"
        >
          <Languages className="w-6 h-6" />
        </button>
      )}

      {/* Expanded Translator Dialog */}
      {isOpen && (
        <div className="w-[340px] md:w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-forest-emerald text-sand-beige p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              <h3 className="font-bold font-sans">Live Translator</h3>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                if (isListening) recognitionRef.current?.stop();
                stopSpeaking();
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selector Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <select 
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as any)}
              className="bg-transparent font-medium text-sm text-charcoal-stone focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>

            <button 
              onClick={swapLanguages}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as any)}
              className="bg-transparent font-medium text-sm text-charcoal-stone focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="cg">Chhattisgarhi (छत्तीसगढ़ी)</option>
            </select>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-5 space-y-6 min-h-[220px]">
            {/* Source Text */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {sourceLang === 'en' ? 'English' : 'Hindi'}
              </div>
              <div className="text-lg text-charcoal-stone font-medium min-h-[30px] break-words">
                {sourceText || <span className="text-gray-300 italic">Tap microphone to speak...</span>}
              </div>
            </div>

            {/* Translated Text */}
            <div className="space-y-2 pt-4 border-t border-gray-100 relative">
              {isTranslating && (
                <div className="absolute top-0 right-0 p-1">
                  <div className="w-4 h-4 border-2 border-tribal-terracotta border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="flex justify-between items-end">
                <div className="text-xs font-bold text-tribal-terracotta uppercase tracking-wider">
                  {targetLang === 'en' ? 'English' : targetLang === 'hi' ? 'Hindi' : 'Chhattisgarhi'}
                </div>
                {translatedText && (
                  <button 
                    onClick={playTranslation}
                    className="p-1.5 bg-tribal-terracotta/10 text-tribal-terracotta rounded-full hover:bg-tribal-terracotta hover:text-white transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className={`text-xl font-bold break-words min-h-[40px] ${targetLang !== 'en' ? 'font-mukta' : ''} text-forest-emerald`}>
                {translatedText}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded-md">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Mic Button */}
          <div className="p-4 bg-gray-50 flex justify-center border-t border-gray-100">
            <button
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-red-500/40"
                  : "bg-forest-emerald text-white shadow-forest-emerald/40"
              }`}
            >
              {isListening ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
