"use client";

import React from 'react';
import { useAccessibility } from './AccessibilityProvider';

export const FontSizeControl: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { settings, toggleSetting } = useAccessibility();

  return (
    <button
      type="button"
      onClick={() => toggleSetting('largeText')}
      aria-pressed={settings.largeText}
      aria-label="Toggle large text mode for enhanced readability"
      title={settings.largeText ? "Normal text size" : "Enlarge text size"}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
        settings.largeText
          ? 'bg-tribal-terracotta text-white shadow-sm'
          : 'bg-sand-beige/40 text-charcoal-stone hover:bg-sand-beige/70 border border-charcoal-stone/20'
      } ${className}`}
    >
      <span className="font-mono text-sm">A+</span>
      <span className="sr-only">{settings.largeText ? 'Large font enabled' : 'Default font size'}</span>
    </button>
  );
};
