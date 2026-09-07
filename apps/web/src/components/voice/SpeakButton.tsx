"use client";

import React from 'react';
import { useVoice } from './VoiceProvider';

interface SpeakButtonProps {
  text: string;
  langCode?: string;
  className?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  langCode = 'en',
  className = '',
}) => {
  const { speak, stop, isSpeaking, isSupported } = useVoice();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stop() : speak(text, langCode))}
      aria-label={isSpeaking ? 'Stop reading aloud' : 'Read aloud with text-to-speech'}
      title={isSpeaking ? 'Stop speech' : 'Listen aloud'}
      className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
        isSpeaking
          ? 'bg-tribal-terracotta text-white animate-pulse'
          : 'bg-sand-beige/60 text-charcoal-stone hover:bg-sand-beige border border-charcoal-stone/20'
      } ${className}`}
    >
      <span aria-hidden="true" className="text-sm">
        {isSpeaking ? '⏹' : '🔊'}
      </span>
      <span className="sr-only">{isSpeaking ? 'Stop' : 'Listen'}</span>
    </button>
  );
};
