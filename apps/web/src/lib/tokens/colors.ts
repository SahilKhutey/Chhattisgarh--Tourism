/**
 * CG Tourism OS — Color Design Tokens
 * Grounded in the biodiversity, geological landscapes, and tribal heritage of Chhattisgarh.
 */

export const PALETTE = {
  // Brand & Heritage Palette
  forestEmerald: '#0A3622',      // Bastar Forest / Sal canopy
  forestEmeraldDark: '#062014',  // Deep forest shade
  forestEmeraldLight: '#185B3C', // Sunlit canopy
  tribalTerracotta: '#B25329',   // Earthen pottery & tribal architecture
  terracottaDark: '#8F3615',     // High-contrast terracotta for text/AA compliance
  riverBlue: '#1A5E7A',          // Mahanadi / Indravati waters
  riverBlueDark: '#103F54',      // Deep river gorge
  riverBlueLight: '#2C84A8',     // Waterfall spray
  sandBeige: '#F4EBE1',          // Natural sandstone & kosa raw silk
  sandBeigeLight: '#FAF5EE',     // Clean paper background
  sandBeigeDark: '#E4D5C3',      // Muted surface border
  charcoalStone: '#1E2229',      // Ancient basalt & megalithic rock
  bellMetalGold: '#D4A373',      // Dhokra bell metal alloy
  warmOrange: '#E67E22',         // Festival marigold & sunset
  mistyForest: '#0F5132',        // Morning fog over Kanger Valley

  // Neutral Scales
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic & Safety Scales
  success: '#15803D',            // Safe corridor / confirmed booking
  successLight: '#DCFCE7',
  warning: '#B45309',            // Weather advisory / seasonal warning
  warningLight: '#FEF3C7',
  danger: '#DC2626',             // High risk / road closure
  dangerLight: '#FEE2E2',
  emergencySos: '#B91C1C',       // 1-Tap SOS Dispatcher (High-urgency red)
  info: '#1D4ED8',               // General travel permit advisory
  infoLight: '#DBEAFE',
} as const;

export type ColorToken = keyof typeof PALETTE;

/**
 * Functional Semantic Color Mappings
 */
export const SEMANTIC_COLORS = {
  background: {
    base: PALETTE.sandBeige,
    surface: PALETTE.sandBeigeLight,
    elevated: PALETTE.white,
    sunken: PALETTE.sandBeigeDark,
    overlay: 'rgba(30, 34, 41, 0.65)',
  },
  text: {
    primary: PALETTE.charcoalStone,
    secondary: PALETTE.gray600,
    muted: PALETTE.gray500,
    inverse: PALETTE.white,
    brandPrimary: PALETTE.forestEmerald,
    brandSecondary: PALETTE.terracottaDark,
    emergency: PALETTE.emergencySos,
  },
  border: {
    subtle: 'rgba(30, 34, 41, 0.1)',
    standard: PALETTE.gray300,
    strong: PALETTE.charcoalStone,
    brand: PALETTE.forestEmerald,
    focus: PALETTE.forestEmerald,
  },
  action: {
    primaryBg: PALETTE.forestEmerald,
    primaryText: PALETTE.sandBeigeLight,
    primaryHover: PALETTE.forestEmeraldDark,
    secondaryBg: PALETTE.tribalTerracotta,
    secondaryText: PALETTE.white,
    secondaryHover: PALETTE.terracottaDark,
    sosBg: PALETTE.emergencySos,
    sosText: PALETTE.white,
  },
} as const;

/**
 * Helper to compute relative luminance per WCAG 2.1 specs
 */
export function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Compute contrast ratio between two hex colors (X:1)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Check if a color pair passes WCAG 2.1 AA (4.5 for normal text, 3.0 for large text)
 */
export function passesWcagAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= (isLargeText ? 3.0 : 4.5);
}
