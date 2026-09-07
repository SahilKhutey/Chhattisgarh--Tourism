"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AccessibilitySettings,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  ACCESSIBILITY_STORAGE_KEY,
} from '../../lib/accessibility/settings';

interface AccessibilityContextProps {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  toggleSetting: (key: keyof AccessibilitySettings) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
        if (saved) {
          return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...JSON.parse(saved) };
        }
      } catch {
        // storage disabled
      }
    }
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  });

  // Apply CSS classes to document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.toggle('large-text', settings.largeText);
      root.classList.toggle('high-contrast', settings.highContrast);
      root.classList.toggle('reduced-motion', settings.reducedMotion);
      root.classList.toggle('low-literacy', settings.lowLiteracy);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, []);

  const toggleSetting = useCallback((key: keyof AccessibilitySettings) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
      } catch {}
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        toggleSetting,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    return {
      settings: DEFAULT_ACCESSIBILITY_SETTINGS,
      updateSetting: () => {},
      toggleSetting: () => {},
      resetSettings: () => {},
    };
  }
  return ctx;
};
