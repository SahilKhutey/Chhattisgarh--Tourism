import {
  getContentRenderer,
  hasContentRenderer,
  registerContentRenderer,
  clearContentRenderers,
} from "@/core/ui/content/registry";
import { validateContentUIModel } from "@/core/ui/content/validate";

describe("content renderer registry", () => {
  beforeEach(() => {
    clearContentRenderers();
  });

  it("registers a renderer", () => {
    const renderer = () => null;

    registerContentRenderer(
      "test-section",
      renderer,
    );

    expect(
      hasContentRenderer("test-section"),
    ).toBe(true);

    expect(
      getContentRenderer("test-section"),
    ).toBe(renderer);
  });

  it("rejects empty renderer types", () => {
    expect(() =>
      registerContentRenderer("", () => null),
    ).toThrow();
  });
});

describe("validateContentUIModel", () => {
  it("validates a well-formed ContentUIModel", () => {
    const result = validateContentUIModel({
      templateId: "tpl-1",
      entryId: "entry-1",
      locale: "en",
      title: "Chitrakote Falls",
      sections: [],
    });

    expect(result.valid).toBe(true);
  });

  it("rejects invalid content models missing required fields", () => {
    const result = validateContentUIModel({
      templateId: "tpl-1",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects non-object inputs", () => {
    const result = validateContentUIModel(null);
    expect(result.valid).toBe(false);
  });
});
