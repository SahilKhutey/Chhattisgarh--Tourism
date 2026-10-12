import {
  SOCIAL_DURATIONS,
  SOCIAL_EASINGS,
  SOCIAL_DEPTH,
  SOCIAL_Z_INDEX,
  getTransitionStyle,
  getStaggerDelay,
} from '../motion';

describe('Social Engine Phase 8 Motion Tokens', () => {
  it('defines correct duration tokens', () => {
    expect(SOCIAL_DURATIONS.instant).toBe(100);
    expect(SOCIAL_DURATIONS.fast).toBe(160);
    expect(SOCIAL_DURATIONS.normal).toBe(220);
    expect(SOCIAL_DURATIONS.medium).toBe(300);
    expect(SOCIAL_DURATIONS.slow).toBe(400);
  });

  it('defines calm cubic-bezier easing tokens', () => {
    expect(SOCIAL_EASINGS.standard).toContain('cubic-bezier');
    expect(SOCIAL_EASINGS.decelerate).toContain('cubic-bezier');
    expect(SOCIAL_EASINGS.accelerate).toContain('cubic-bezier');
    expect(SOCIAL_EASINGS.spring).toContain('cubic-bezier');
  });

  it('defines depth levels with appropriate blur and background classes', () => {
    expect(SOCIAL_DEPTH.level0.blur).toBe('none');
    expect(SOCIAL_DEPTH.level1.blur).toBe('8px');
    expect(SOCIAL_DEPTH.level1.className).toContain('backdrop-blur-md');
    expect(SOCIAL_DEPTH.level2.blur).toBe('16px');
    expect(SOCIAL_DEPTH.level2.className).toContain('backdrop-blur-xl');
  });

  it('maintains strict z-index stacking hierarchy', () => {
    expect(SOCIAL_Z_INDEX.base).toBe(0);
    expect(SOCIAL_Z_INDEX.cardOverlay).toBe(10);
    expect(SOCIAL_Z_INDEX.sticky).toBe(100);
    expect(SOCIAL_Z_INDEX.dropdown).toBe(200);
    expect(SOCIAL_Z_INDEX.drawer).toBe(300);
    expect(SOCIAL_Z_INDEX.modal).toBe(400);
    expect(SOCIAL_Z_INDEX.toast).toBe(500);

    expect(SOCIAL_Z_INDEX.sticky).toBeGreaterThan(SOCIAL_Z_INDEX.cardOverlay);
    expect(SOCIAL_Z_INDEX.drawer).toBeGreaterThan(SOCIAL_Z_INDEX.sticky);
    expect(SOCIAL_Z_INDEX.modal).toBeGreaterThan(SOCIAL_Z_INDEX.drawer);
  });

  it('computes transition styles accurately', () => {
    const single = getTransitionStyle('opacity', 'fast', 'standard');
    expect(single).toBe(`opacity 160ms ${SOCIAL_EASINGS.standard}`);

    const multiple = getTransitionStyle(['transform', 'opacity'], 'normal', 'decelerate');
    expect(multiple).toBe(
      `transform 220ms ${SOCIAL_EASINGS.decelerate}, opacity 220ms ${SOCIAL_EASINGS.decelerate}`
    );
  });

  it('computes staggered delays with cap', () => {
    expect(getStaggerDelay(0)).toBe(0);
    expect(getStaggerDelay(2, 50)).toBe(100);
    expect(getStaggerDelay(100, 50, 300)).toBe(300);
  });
});
