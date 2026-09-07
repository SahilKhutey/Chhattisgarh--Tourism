"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { normalizeLocale } from '../../lib/i18n/config';

interface VoiceContextProps {
  speak: (text: string, langCode?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

const VoiceContext = createContext<VoiceContextProps | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, langCode: string = 'en') => {
      if (!synthRef.current || !text?.trim()) return;

      stop(); // Stop existing speech

      const utterance = new SpeechSynthesisUtterance(text.trim());
      const norm = normalizeLocale(langCode);

      // Language tagging: Indian accented English or Hindi voice
      if (norm === 'en') {
        utterance.lang = 'en-IN';
      } else {
        // Both hi and hne (Chhattisgarhi) route through hi-IN Indic phonetics
        utterance.lang = 'hi-IN';
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [stop],
  );

  return (
    <VoiceContext.Provider value={{ speak, stop, isSpeaking, isSupported }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return ctx;
};
