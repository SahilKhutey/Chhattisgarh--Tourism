import { isBlockingUIState, type UIState } from "@/lib/ui/ui-state";

describe("UI State Contract", () => {
  it("correctly identifies blocking states", () => {
    const blockingStates: UIState[] = [
      "loading",
      "error",
      "offline",
      "unauthorized",
      "forbidden",
      "not-found",
    ];

    blockingStates.forEach((state) => {
      expect(isBlockingUIState(state)).toBe(true);
    });
  });

  it("correctly identifies non-blocking states", () => {
    const nonBlockingStates: UIState[] = ["idle", "success", "empty"];

    nonBlockingStates.forEach((state) => {
      expect(isBlockingUIState(state)).toBe(false);
    });
  });
});
