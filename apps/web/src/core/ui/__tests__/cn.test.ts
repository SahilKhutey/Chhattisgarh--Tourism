import { cn } from "@/lib/ui/cn";

describe("cn", () => {
  it("combines valid class names", () => {
    expect(
      cn("flex", "items-center"),
    ).toBe("flex items-center");
  });

  it("removes falsy values", () => {
    expect(
      cn("flex", false, undefined, null, "gap-4"),
    ).toBe("flex gap-4");
  });
});
