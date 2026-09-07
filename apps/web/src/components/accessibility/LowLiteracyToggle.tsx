"use client";

import React from 'react';
import { useAccessibility } from './AccessibilityProvider';

export const LowLiteracyToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { settings, toggleSetting } = useAccessibility();

  return (
    <button
      type="button"
      onClick={() => toggleSetting('lowLiteracy')}
      aria-pressed={settings.lowLiteracy}
      aria-label="Toggle simplified reading mode for low literacy"
      title={settings.lowLiteracy ? "Disable picture reading mode" : "Enable picture reading mode"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        settings.lowLiteracy
          ? 'bg-tribal-terracotta text-white shadow-sm'
          : 'bg-sand-beige/40 text-charcoal-stone hover:bg-sand-beige/70 border border-charcoal-stone/20'
      } ${className}`}
    >
      <span aria-hidden="true" className="text-base">📖</span>
      <span className="hidden sm:inline">
        {settings.lowLiteracy ? 'Simple Mode ON' : 'Simple Mode'}
      </span>
    </button>
  );
};
