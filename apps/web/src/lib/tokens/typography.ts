/**
 * CG Tourism OS — Typography Tokens
 * Designed to ensure visual elegance, optical hierarchy, and high legibility across
 * both Latin (English) and Devanagari (Hindi, Chhattisgarhi) scripts.
 */

export const FONT_FAMILIES = {
  sans: 'var(--font-geist-sans), "Noto Sans Devanagari", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: '"Merriweather", "Noto Serif Devanagari", Georgia, serif',
  mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as const;

export const FONT_SIZES = {
  xs: { size: '0.75rem', lineHeight: '1rem', px: 12 },      // 12px - Captions, tags, map coordinates
  sm: { size: '0.875rem', lineHeight: '1.25rem', px: 14 },  // 14px - Secondary labels, metadata
  base: { size: '1rem', lineHeight: '1.5rem', px: 16 },      // 16px - Primary body copy, inputs
  lg: { size: '1.125rem', lineHeight: '1.75rem', px: 18 },  // 18px - Lead paragraphs, section intros
  xl: { size: '1.25rem', lineHeight: '1.75rem', px: 20 },   // 20px - Subheadings (H4), Card titles
  '2xl': { size: '1.5rem', lineHeight: '2rem', px: 24 },    // 24px - Section Headings (H3)
  '3xl': { size: '1.875rem', lineHeight: '2.25rem', px: 30 }, // 30px - Subsection banners (H2)
  '4xl': { size: '2.25rem', lineHeight: '2.5rem', px: 36 },  // 36px - District/Circuit Hero (H1)
  '5xl': { size: '3rem', lineHeight: '1.15', px: 48 },      // 48px - Primary Display Title
  '6xl': { size: '3.75rem', lineHeight: '1.1', px: 60 },    // 60px - Landing Billboard Hero
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const LETTER_SPACINGS = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;
