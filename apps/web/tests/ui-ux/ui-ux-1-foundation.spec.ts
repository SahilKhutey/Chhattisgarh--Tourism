/**
 * UI/UX-1 Foundation & Design Architecture Verification Suite
 * Validates design tokens, mathematical WCAG 2.1 AA contrast compliance,
 * 4px spacing rhythm, typography monotonicity, and state contracts.
 */

import {
  PALETTE,
  SEMANTIC_COLORS,
  getRelativeLuminance,
  getContrastRatio,
  passesWcagAA,
  FONT_SIZES,
  FONT_FAMILIES,
  SPACING_PX,
  TOUCH_TARGETS,
  BREAKPOINTS,
  UI_LIFECYCLE_STATES,
  ERROR_SEVERITY_LEVELS,
} from '../../src/lib/tokens';

describe('UI/UX-1: UX Foundation & Design Architecture Suite', () => {
  describe('WCAG 2.1 AA Color Contrast Mathematical Verification', () => {
    test('Calculates relative luminance correctly for black and white', () => {
      expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 4);
      expect(getRelativeLuminance('#FFFFFF')).toBeCloseTo(1, 4);
    });

    test('Primary body text on background exceeds WCAG 2.1 AA (4.5:1)', () => {
      const text = SEMANTIC_COLORS.text.primary; // Charcoal Stone #1E2229
      const bg = SEMANTIC_COLORS.background.base; // Sand Beige #F4EBE1
      const ratio = getContrastRatio(text, bg);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(passesWcagAA(text, bg)).toBe(true);
      // Ensure it even reaches AAA standard (> 7.0:1)
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    test('Primary action button text on Forest Emerald exceeds WCAG 2.1 AA (4.5:1)', () => {
      const text = SEMANTIC_COLORS.action.primaryText; // Sand Beige Light #FAF5EE
      const bg = SEMANTIC_COLORS.action.primaryBg;    // Bastar Forest Emerald #0A3622
      const ratio = getContrastRatio(text, bg);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(passesWcagAA(text, bg)).toBe(true);
    });

    test('High-contrast dark terracotta on sand beige background exceeds WCAG 2.1 AA', () => {
      const text = PALETTE.terracottaDark; // #8F3615
      const bg = PALETTE.sandBeige;        // #F4EBE1
      const ratio = getContrastRatio(text, bg);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(passesWcagAA(text, bg)).toBe(true);
    });

    test('Emergency SOS button contrast satisfies high-urgency readability', () => {
      const text = SEMANTIC_COLORS.action.sosText; // White
      const bg = SEMANTIC_COLORS.action.sosBg;     // Emergency Red
      const ratio = getContrastRatio(text, bg);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(passesWcagAA(text, bg)).toBe(true);
    });
  });

  describe('4px Grid Spacing & Touch Target Compliance', () => {
    test('All spacing tokens are strict multiples of 4px', () => {
      Object.entries(SPACING_PX).forEach(([step, px]) => {
        expect(px % 4).toBe(0);
        if (Number(step) > 0) {
          expect(px).toBeGreaterThanOrEqual(4);
        }
      });
    });

    test('Minimum touch target meets or exceeds WCAG 2.1 AA 44px threshold', () => {
      const minTouchPx = parseInt(TOUCH_TARGETS.min, 10);
      expect(minTouchPx).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Typography Scale Monotonicity & Font Coverage', () => {
    test('Font sizes scale strictly monotonically', () => {
      const order = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const;
      for (let i = 0; i < order.length - 1; i++) {
        const currentPx = FONT_SIZES[order[i]].px;
        const nextPx = FONT_SIZES[order[i + 1]].px;
        expect(nextPx).toBeGreaterThan(currentPx);
      }
    });

    test('Sans font family supports both Latin and Devanagari Unicode scripts', () => {
      expect(FONT_FAMILIES.sans).toContain('Noto Sans Devanagari');
      expect(FONT_FAMILIES.sans).toContain('sans-serif');
    });
  });

  describe('Responsive Breakpoints & Layout Contracts', () => {
    test('Breakpoints scale strictly monotonically across all 6 tiers', () => {
      expect(BREAKPOINTS.xs).toBeLessThan(BREAKPOINTS.sm);
      expect(BREAKPOINTS.sm).toBeLessThan(BREAKPOINTS.md);
      expect(BREAKPOINTS.md).toBeLessThan(BREAKPOINTS.lg);
      expect(BREAKPOINTS.lg).toBeLessThan(BREAKPOINTS.xl);
      expect(BREAKPOINTS.xl).toBeLessThan(BREAKPOINTS['2xl']);
    });

    test('Ultra-compact breakpoint xs covers low-cost Android field devices (360px)', () => {
      expect(BREAKPOINTS.xs).toBeLessThanOrEqual(360);
    });
  });

  describe('State Machine & Error Taxonomy Contracts', () => {
    test('UI lifecycle states include all 6 required canonical states', () => {
      const expected = ['INITIAL', 'LOADING', 'READY', 'EMPTY', 'ERROR', 'OFFLINE_SYNCING'];
      expected.forEach((state) => {
        expect(UI_LIFECYCLE_STATES).toContain(state);
      });
    });

    test('Error severity includes EMERGENCY for SOS dispatcher failsafe', () => {
      expect(ERROR_SEVERITY_LEVELS).toContain('EMERGENCY');
      expect(ERROR_SEVERITY_LEVELS).toContain('RECOVERABLE');
      expect(ERROR_SEVERITY_LEVELS).toContain('DEGRADED');
      expect(ERROR_SEVERITY_LEVELS).toContain('FATAL');
    });
  });
});
