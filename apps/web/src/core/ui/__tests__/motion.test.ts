import {
  motionDuration,
  motionEase,
  motionDistance,
  motionScale,
  motionClasses,
  getMotionDurationMs,
  createTransition,
  isValidInteractionState,
  interactionMatrix,
  prefersReducedMotion,
} from "../motion";

describe("Motion Tokens and Contracts", () => {
  it("defines canonical durations with correct millisecond strings", () => {
    expect(motionDuration.instant).toBe("0ms");
    expect(motionDuration.micro).toBe("100ms");
    expect(motionDuration.fast).toBe("150ms");
    expect(motionDuration.normal).toBe("200ms");
    expect(motionDuration.moderate).toBe("300ms");
    expect(motionDuration.slow).toBe("450ms");
    expect(motionDuration.reveal).toBe("600ms");
  });

  it("defines canonical cubic-bezier easings", () => {
    expect(motionEase.standard).toContain("cubic-bezier");
    expect(motionEase.entrance).toContain("cubic-bezier");
    expect(motionEase.exit).toContain("cubic-bezier");
    expect(motionEase.emphasized).toContain("cubic-bezier");
  });

  it("defines spatial distances", () => {
    expect(motionDistance.xs).toBe(4);
    expect(motionDistance.sm).toBe(8);
    expect(motionDistance.md).toBe(16);
    expect(motionDistance.lg).toBe(24);
    expect(motionDistance.xl).toBe(40);
  });

  it("defines tactile interaction scale factors", () => {
    expect(motionScale.press).toBe(0.98);
    expect(motionScale.subtle).toBe(1.02);
  });

  it("registers canonical CSS motion classes", () => {
    expect(motionClasses.fadeIn).toBe("cg-motion-fade-in");
    expect(motionClasses.slideUp).toBe("cg-motion-slide-up");
    expect(motionClasses.scaleIn).toBe("cg-motion-scale-in");
    expect(motionClasses.reveal).toBe("cg-motion-reveal");
    expect(motionClasses.stagger).toBe("cg-stagger");
  });

  it("computes duration in milliseconds correctly", () => {
    expect(getMotionDurationMs("instant")).toBe(0);
    expect(getMotionDurationMs("micro")).toBe(100);
    expect(getMotionDurationMs("fast")).toBe(150);
    expect(getMotionDurationMs("normal")).toBe(200);
    expect(getMotionDurationMs("moderate")).toBe(300);
    expect(getMotionDurationMs("slow")).toBe(450);
    expect(getMotionDurationMs("reveal")).toBe(600);
  });

  it("creates CSS transition definitions correctly", () => {
    const transition = createTransition(["opacity", "transform"], "fast", "standard");
    expect(transition).toContain("opacity 150ms");
    expect(transition).toContain("transform 150ms");
  });

  it("validates interaction states against matrix", () => {
    expect(isValidInteractionState("idle")).toBe(true);
    expect(isValidInteractionState("hover")).toBe(true);
    expect(isValidInteractionState("press")).toBe(true);
    expect(isValidInteractionState("focus")).toBe(true);
    expect(isValidInteractionState("loading")).toBe(true);
    expect(isValidInteractionState("success")).toBe(true);
    expect(isValidInteractionState("invalid_state")).toBe(false);

    expect(interactionMatrix.button.press).toBe("scale(0.98)");
    expect(interactionMatrix.card.hover).toBe("translateY(-2px)");
  });

  it("handles reduced motion query safely in test environment", () => {
    const result = prefersReducedMotion();
    expect(typeof result).toBe("boolean");
  });
});
