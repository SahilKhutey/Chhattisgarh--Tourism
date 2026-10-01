import { createUIId, resetUIIdSequence } from "@/core/ui/accessibility/ids";

describe("createUIId", () => {
  beforeEach(() => {
    resetUIIdSequence();
  });

  it("generates deterministic sequential IDs", () => {
    expect(createUIId("cg-button")).toBe("cg-button-1");
    expect(createUIId("cg-button")).toBe("cg-button-2");
    expect(createUIId()).toBe("cg-ui-3");
  });
});
