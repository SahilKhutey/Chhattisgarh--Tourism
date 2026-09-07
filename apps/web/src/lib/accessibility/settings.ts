export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  lowLiteracy: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  lowLiteracy: false,
};

export const ACCESSIBILITY_STORAGE_KEY = 'cg_accessibility_settings';
