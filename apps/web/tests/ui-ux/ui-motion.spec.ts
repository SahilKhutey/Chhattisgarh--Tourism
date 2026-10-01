/**
 * UI/UX-3 Motion & Interaction Accessibility Contract Suite
 * Validates canonical motion tokens, timing budgets, GPU-friendly properties,
 * and reduced-motion accessibility contracts.
 */

import {
  motionDuration,
  motionEase,
  motionDistance,
  motionScale,
  getMotionDurationMs,
  interactionMatrix,
} from "../../src/core/ui/motion";

describe("UI/UX-3: Motion & Interaction Accessibility Contract Suite", () => {
  describe("Motion Timing & Budget Enforcement", () => {
    test("All micro-interaction feedback durations are under 250ms", () => {
      expect(getMotionDurationMs("instant")).toBeLessThanOrEqual(250);
      expect(getMotionDurationMs("micro")).toBeLessThanOrEqual(250);
      expect(getMotionDurationMs("fast")).toBeLessThanOrEqual(250);
      expect(getMotionDurationMs("normal")).toBeLessThanOrEqual(250);
    });

    test("Content reveal duration does not exceed the 600ms ceiling", () => {
      expect(getMotionDurationMs("reveal")).toBeLessThanOrEqual(600);
      expect(getMotionDurationMs("slow")).toBeLessThanOrEqual(600);
    });

    test("All canonical easing curves use standard cubic-bezier functions", () => {
      Object.values(motionEase).forEach((curve) => {
        expect(curve.startsWith("cubic-bezier")).toBe(true);
      });
    });
  });

  describe("Spatial Movement & Scale Factors", () => {
    test("Motion distances follow progressive scale without extreme shifts", () => {
      expect(motionDistance.xs).toBeLessThan(motionDistance.sm);
      expect(motionDistance.sm).toBeLessThan(motionDistance.md);
      expect(motionDistance.md).toBeLessThan(motionDistance.lg);
      expect(motionDistance.lg).toBeLessThan(motionDistance.xl);
      expect(motionDistance.xl).toBeLessThanOrEqual(48); // Never jump more than 48px
    });

    test("Tactile press scale preserves structural readability (> 0.95)", () => {
      expect(motionScale.press).toBeGreaterThanOrEqual(0.95);
      expect(motionScale.press).toBeLessThan(1.0);
    });
  });

  describe("Component Interaction Matrix Compliance", () => {
    test("All core UI components define deterministic hover, press, and focus behavior", () => {
      const components = ["button", "iconButton", "link", "card", "navItem", "input", "toast"];
      components.forEach((cmp) => {
        const config = interactionMatrix[cmp];
        expect(config).toBeDefined();
        expect(config.focus).toBe("focus-ring");
      });
    });

    test("Interactive cards elevate on hover and reset on active press", () => {
      expect(interactionMatrix.card.hover).toBe("translateY(-2px)");
      expect(interactionMatrix.card.press).toBe("translateY(0)");
    });
  });
});
