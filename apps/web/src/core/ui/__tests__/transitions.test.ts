import {
  transitionPolicy,
  transitionDurationMs,
  getTransitionConfig,
} from "@/core/ui/transitions/policies";

describe("Transition Policies & Configs", () => {
  it("defines standard transition policies for route, content, modal, navigation", () => {
    expect(transitionPolicy.route.type).toBe("fade");
    expect(transitionPolicy.route.duration).toBe("fast");

    expect(transitionPolicy.content.type).toBe("slide-up");
    expect(transitionPolicy.content.duration).toBe("normal");

    expect(transitionPolicy.modal.type).toBe("scale");
    expect(transitionPolicy.modal.duration).toBe("fast");

    expect(transitionPolicy.navigation.type).toBe("slide-down");
    expect(transitionPolicy.navigation.duration).toBe("fast");
  });

  it("provides expected duration milliseconds", () => {
    expect(transitionDurationMs.fast).toBe(180);
    expect(transitionDurationMs.normal).toBe(240);
    expect(transitionDurationMs.moderate).toBe(360);
  });

  it("resolves CSS classes and duration for supported transition variants", () => {
    const fade = getTransitionConfig("fade", "fast");
    expect(fade.animationClass).toBe("cg-transition-fade");
    expect(fade.durationMs).toBe(180);

    const slideUp = getTransitionConfig("slide-up", "normal");
    expect(slideUp.animationClass).toBe("cg-transition-slide-up");
    expect(slideUp.durationMs).toBe(240);

    const scale = getTransitionConfig("scale", "fast");
    expect(scale.animationClass).toBe("cg-transition-scale");
    expect(scale.durationMs).toBe(180);

    const none = getTransitionConfig("none");
    expect(none.animationClass).toBe("");
    expect(none.durationMs).toBe(0);
  });
});
