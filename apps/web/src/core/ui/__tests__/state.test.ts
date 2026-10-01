import {
  isErrorState,
  isLoadingState,
  isTerminalState,
} from "@/core/ui/state/helpers";

describe("UI state helpers", () => {
  it("identifies loading", () => {
    expect(isLoadingState("loading")).toBe(true);
  });

  it("identifies terminal states", () => {
    expect(isTerminalState("success")).toBe(true);
    expect(isTerminalState("empty")).toBe(true);
  });

  it("identifies error states", () => {
    expect(isErrorState("error")).toBe(true);
    expect(isErrorState("offline")).toBe(true);
  });
});
